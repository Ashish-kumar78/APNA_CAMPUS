import { useEffect, useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Star,
  UploadCloud,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  User,
  Plus,
  Info,
  X,
  MessageSquare
} from 'lucide-react'
import { downloadSyllabusPdf } from '../utils/pdfGenerator'
import { notesApi } from '../services/notesApi'
import { api } from '../services/api'
import './AcademicsPage.css'

const semesters = [
  {
    label: '5th Semester (Current)',
    current: true,
    subjects: [
      { code: 'CS501', name: 'Artificial Intelligence', credits: 4, faculty: 'Dr. P. Mohapatra', type: 'Theory', syllabus: true },
      { code: 'CS502', name: 'Machine Learning', credits: 4, faculty: 'Dr. S. Rath', type: 'Theory', syllabus: true },
      { code: 'CS503', name: 'Cloud Computing', credits: 3, faculty: 'Prof. R. Nayak', type: 'Theory', syllabus: true },
      { code: 'CS504', name: 'Compiler Design', credits: 3, faculty: 'Dr. A. Panda', type: 'Theory', syllabus: true },
      { code: 'CS505', name: 'AI Lab', credits: 2, faculty: 'Dr. P. Mohapatra', type: 'Lab', syllabus: false },
      { code: 'CS506', name: 'Project Work – Phase I', credits: 2, faculty: 'Dr. S. Mohanty', type: 'Project', syllabus: false },
    ],
  },
  {
    label: '4th Semester',
    current: false,
    subjects: [
      { code: 'CS401', name: 'Operating Systems', credits: 4, faculty: 'Dr. R. Sahoo', type: 'Theory', grade: 'A', sgpa: 8.5 },
      { code: 'CS402', name: 'Algorithms', credits: 4, faculty: 'Prof. S. Mishra', type: 'Theory', grade: 'A+', sgpa: 9.0 },
      { code: 'CS403', name: 'Computer Networks', credits: 3, faculty: 'Dr. B. Das', type: 'Theory', grade: 'B+', sgpa: 7.5 },
      { code: 'CS404', name: 'Theory of Computation', credits: 3, faculty: 'Dr. P. Behera', type: 'Theory', grade: 'A', sgpa: 8.5 },
      { code: 'CS405', name: 'Web Technologies', credits: 3, faculty: 'Prof. N. Sethi', type: 'Theory', grade: 'A+', sgpa: 9.0 },
    ],
  },
  {
    label: '3rd Semester',
    current: false,
    subjects: [
      { code: 'CS301', name: 'Discrete Mathematics', credits: 4, faculty: 'Dr. A. Tripathy', type: 'Theory', grade: 'A', sgpa: 8.5 },
      { code: 'CS302', name: 'Data Structures', credits: 4, faculty: 'Dr. S. Mohanty', type: 'Theory', grade: 'A+', sgpa: 9.0 },
      { code: 'CS303', name: 'Computer Organization', credits: 3, faculty: 'Prof. B. Pati', type: 'Theory', grade: 'B+', sgpa: 7.5 },
      { code: 'CS304', name: 'Database Systems', credits: 3, faculty: 'Dr. K. Dash', type: 'Theory', grade: 'A', sgpa: 8.5 },
      { code: 'CS305', name: 'Software Engineering', credits: 3, faculty: 'Prof. S. Nanda', type: 'Theory', grade: 'A', sgpa: 8.5 },
    ],
  },
]

export default function AcademicsPage() {
  const [openSemester, setOpenSemester] = useState(0)
  const [activeTab, setActiveTab] = useState('subjects')
  const [classNotes, setClassNotes] = useState([])

  // Quick Upload Notes Modal in Academics
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedSubjectName, setSelectedSubjectName] = useState('Operating Systems')
  const [uploadForm, setUploadForm] = useState({
    topic: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [viewingNote, setViewingNote] = useState(null)

  const [enrollments, setEnrollments] = useState([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)

  const cgpa = 8.42

  useEffect(() => {
    loadClassNotes()
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      setLoadingEnrollments(true)
      const data = await api.getStudentEnrollments('2305201001')
      if (Array.isArray(data) && data.length > 0) {
        setEnrollments(data)
      }
    } catch {
      // Keep default
    } finally {
      setLoadingEnrollments(false)
    }
  }

  const loadClassNotes = async () => {
    const list = await notesApi.getClassNotes({ subject: 'ALL' })
    if (list) setClassNotes(list)
  }

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (evt) => setFilePreview(evt.target.result)
      reader.readAsDataURL(file)
    } else {
      setFilePreview('PDF')
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!uploadForm.topic.trim()) {
      showToast('Please enter the topic covered.')
      return
    }
    if (!selectedFile) {
      showToast('Please select a handwritten note image or PDF file.')
      return
    }

    const payload = {
      subject: selectedSubjectName,
      date: uploadForm.date,
      topic: uploadForm.topic.trim(),
      description: uploadForm.description.trim(),
      previewUrl: filePreview,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      studentName: 'Rakesh Das',
      rollNumber: '2305201001'
    }

    const res = await notesApi.uploadClassNotes(payload)
    if (res && res.success) {
      showToast('Class notes uploaded successfully!')
      setShowUploadModal(false)
      setSelectedFile(null)
      setFilePreview('')
      setUploadForm({ topic: '', description: '', date: new Date().toISOString().split('T')[0] })
      await loadClassNotes()
    }
  }

  return (
    <div className="academics-page">
      {toastMsg && (
        <div className="academics-toast">
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="academics-header">
        <div className="academics-header-left">
          <p className="academics-kicker"><BookOpen size={13} /> ACADEMIC RECORD & CLASS STUDY MATERIALS</p>
          <h2>Academics</h2>
          <p className="academics-caption">Courses, syllabus, academic performance & peer-shared class notes.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn-academic-upload-notes"
            onClick={() => {
              setSelectedSubjectName('Operating Systems')
              setShowUploadModal(true)
            }}
          >
            <UploadCloud size={16} /> Upload Notes
          </button>
          <div className="academics-cgpa-badge">
            <Star size={14} />
            <span>CGPA</span>
            <strong>{cgpa}</strong>
            <small>/ 10.0</small>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="academics-tabs" role="tablist">
        {[
          { id: 'subjects', label: 'Enrolled Subjects' },
          { id: 'results', label: 'Results & Grades' },
          { id: 'progression', label: 'Programme & Term History' },
          { id: 'syllabus', label: 'Syllabus' },
          { id: 'notes', label: `Class Notes & Materials (${classNotes.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ENROLLED SUBJECTS + INTEGRATED SUBJECT-WISE NOTES */}
      {activeTab === 'subjects' && (
        <div className="academics-semester-list">
          {semesters.map((sem, index) => (
            <div className={`semester-accordion ${sem.current ? 'current' : ''}`} key={sem.label}>
              <button
                className="semester-accordion-head"
                onClick={() => setOpenSemester(openSemester === index ? -1 : index)}
                aria-expanded={openSemester === index}
              >
                <span className="semester-label">
                  {sem.label}
                  {sem.current && <span className="semester-badge">ACTIVE</span>}
                </span>
                <span className="semester-meta">{sem.subjects.length} subjects · {sem.subjects.reduce((s, c) => s + c.credits, 0)} credits</span>
                <ChevronDown size={14} className={openSemester === index ? 'rotated' : ''} />
              </button>
              {openSemester === index && (
                <div className="semester-accordion-body">
                  <div className="subject-table-wrap">
                    <table className="subject-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Subject</th>
                          <th>Type</th>
                          <th>Credits</th>
                          <th>Faculty</th>
                          <th>Class Notes</th>
                          {!sem.current && <th>Grade</th>}
                          {sem.current && <th>Syllabus</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {sem.subjects.map((sub) => {
                          const matchingNotes = classNotes.filter(
                            (n) => n.subject.toLowerCase() === sub.name.toLowerCase() || n.subject.toLowerCase().includes(sub.name.toLowerCase().split(' ')[0])
                          )
                          const verifiedCount = matchingNotes.filter((n) => n.isFacultyVerified).length

                          return (
                            <tr key={sub.code}>
                              <td><code>{sub.code}</code></td>
                              <td><strong>{sub.name}</strong></td>
                              <td><span className={`subject-type-tag ${sub.type.toLowerCase()}`}>{sub.type}</span></td>
                              <td>{sub.credits}</td>
                              <td>{sub.faculty}</td>

                              {/* NEW: Upload & Verified Notes column for each subject */}
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {verifiedCount > 0 ? (
                                    <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                      <ShieldCheck size={12} /> {verifiedCount} Verified
                                    </span>
                                  ) : matchingNotes.length > 0 ? (
                                    <span style={{ fontSize: '0.72rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>
                                      {matchingNotes.length} Notes
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>No notes</span>
                                  )}

                                  <button
                                    type="button"
                                    className="btn-sub-notes-upload"
                                    title="Upload Class Notes for this Subject"
                                    onClick={() => {
                                      setSelectedSubjectName(sub.name)
                                      setShowUploadModal(true)
                                    }}
                                  >
                                    <Plus size={12} /> Upload
                                  </button>

                                  <button
                                    type="button"
                                    style={{
                                      background: 'rgba(59, 130, 246, 0.1)',
                                      border: '1px solid rgba(59, 130, 246, 0.3)',
                                      color: '#2563eb',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Open Campus Connect Discussion for this Subject"
                                    onClick={() => {
                                      const convMap = {
                                        'Data Structures': 'conv-ds',
                                        'Artificial Intelligence': 'conv-cse-ai',
                                        'Database Systems': 'conv-dbms',
                                        'Operating Systems': 'conv-os',
                                        'Computer Networks': 'conv-cn'
                                      };
                                      window.dispatchEvent(new CustomEvent('cms_navigate_chat', { detail: { convId: convMap[sub.name] || 'conv-ds' } }));
                                    }}
                                  >
                                    <MessageSquare size={12} /> Chat
                                  </button>
                                </div>
                              </td>

                              {!sem.current && (
                                <td>
                                  <span className={`grade-pill grade-${sub.grade?.replace('+', 'p')}`}>{sub.grade}</span>
                                </td>
                              )}
                              {sem.current && (
                                <td>
                                  {sub.syllabus
                                    ? <button className="syllabus-link" onClick={() => downloadSyllabusPdf(sub)}><Download size={12} />PDF</button>
                                    : <span className="no-syllabus">—</span>
                                  }
                                </td>
                              )}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CLASS NOTES & VERIFIED MATERIALS */}
      {activeTab === 'notes' && (
        <div className="academics-notes-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Class Notes & Verified Peer Study Materials</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                Handwritten notes, lecture diagrams & board photos shared by students. Verified by course faculty.
              </p>
            </div>
            <button 
              type="button"
              className="btn-academic-upload-notes"
              onClick={() => {
                setSelectedSubjectName('Operating Systems')
                setShowUploadModal(true)
              }}
            >
              <UploadCloud size={16} /> Upload Notes
            </button>
          </div>

          {/* Verified Notes appear first with a banner */}
          {classNotes.some((n) => n.isFacultyVerified) && (
            <div style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)', border: '1.5px solid #6ee7b7', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#059669" />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#065f46' }}>Faculty Verified Notes Available</strong>
                <div style={{ fontSize: '0.78rem', color: '#047857' }}>Notes marked with ✓ have been reviewed and approved by your subject faculty.</div>
              </div>
            </div>
          )}

          <div className="academic-notes-grid">
            {/* Sort: verified notes appear first */}
            {[...classNotes]
              .sort((a, b) => (b.isFacultyVerified ? 1 : 0) - (a.isFacultyVerified ? 1 : 0))
              .map((note) => {
                const isImage = note.fileType && note.fileType.startsWith('image/')
                const isBase64Image = note.fileUrl && note.fileUrl.startsWith('data:image')
                const showThumbnail = isImage || isBase64Image

                return (
                  <div key={note.id} className={`academic-note-card ${note.isFacultyVerified ? 'note-card-verified' : ''}`}>
                    {/* Image Thumbnail Preview */}
                    {showThumbnail && (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', background: '#0f172a', maxHeight: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={note.fileUrl}
                          alt={note.topic}
                          style={{ width: '100%', maxHeight: '130px', objectFit: 'cover', display: 'block', opacity: 0.95 }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                    )}
                    {!showThumbnail && note.fileType === 'application/pdf' && (
                      <div style={{ background: '#e0e7ff', borderRadius: '8px', padding: '14px', textAlign: 'center', marginBottom: '10px', color: '#4338ca' }}>
                        <FileText size={32} />
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{note.fileName || 'PDF Document'}</div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span className="note-subject-tag">{note.subject}</span>
                      {note.isFacultyVerified ? (
                        <span className="academic-badge-verified">
                          <ShieldCheck size={13} /> ✓ Faculty Verified
                        </span>
                      ) : (
                        <span className="academic-badge-pending">Student Uploaded</span>
                      )}
                    </div>

                    <h4 style={{ margin: '4px 0', fontSize: '1rem', color: '#0f172a' }}>{note.topic}</h4>
                    <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 12px', lineHeight: 1.4 }}>{note.description}</p>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                      <div>
                        <span><Calendar size={12} /> {note.date}</span> · 
                        <span> By: <strong>{note.uploadedBy?.name}</strong></span>
                      </div>
                      <button 
                        type="button" 
                        className="btn-view-academic-note"
                        onClick={() => setViewingNote(note)}
                      >
                        <Eye size={13} /> View Note
                      </button>
                    </div>
                  </div>
                )
              })
            }
          </div>

          {classNotes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <BookOpen size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <h4 style={{ margin: '0 0 6px', color: '#64748b' }}>No class notes yet</h4>
              <p style={{ margin: 0, fontSize: '0.84rem' }}>Be the first to share handwritten notes for your class!</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RESULTS */}
      {activeTab === 'results' && (
        <div className="academics-results">
          <div className="results-summary-grid">
            <div className="results-summary-card">
              <GraduationCap size={22} />
              <strong>8.42</strong>
              <span>Overall CGPA</span>
            </div>
            <div className="results-summary-card">
              <Star size={22} />
              <strong>9.0</strong>
              <span>Highest SGPA</span>
            </div>
            <div className="results-summary-card">
              <BookOpen size={22} />
              <strong>84</strong>
              <span>Total Credits</span>
            </div>
            <div className="results-summary-card">
              <FileText size={22} />
              <strong>4 / 4</strong>
              <span>Semesters Passed</span>
            </div>
          </div>

          <div className="result-semester-table-wrap">
            <table className="result-semester-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Credits Earned</th>
                  <th>SGPA</th>
                  <th>Result</th>
                  <th>Marksheet</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1st Semester', 20, 8.14, 'Passed'],
                  ['2nd Semester', 21, 8.42, 'Passed'],
                  ['3rd Semester', 23, 8.45, 'Passed'],
                  ['4th Semester', 20, 8.68, 'Passed'],
                  ['5th Semester', '—', '—', 'In Progress'],
                ].map(([sem, credits, sgpa, result]) => (
                  <tr key={sem}>
                    <th scope="row">{sem}</th>
                    <td>{credits}</td>
                    <td>{sgpa !== '—' ? <span className="sgpa-chip">{sgpa}</span> : '—'}</td>
                    <td>
                      <span className={`result-status ${result === 'Passed' ? 'passed' : result === 'In Progress' ? 'progress' : 'pending'}`}>
                        {result}
                      </span>
                    </td>
                    <td>
                      {result === 'Passed'
                        ? <button className="marksheet-btn"><ExternalLink size={11} />View</button>
                        : <span className="no-syllabus">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PROGRAMME & PROGRESSION HISTORY */}
      {activeTab === 'progression' && (
        <div className="academics-progression-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered Programme</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>B.Tech Computer Science &amp; Engg.</div>
              <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>Code: BTECH-CSE · 4 Years (8 Semesters)</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Autonomous Affiliation</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>GIFT Autonomous College</div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>UGC &amp; BPUT Autonomous Curriculum</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Academic Batch</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>2023 – 2027 Admission Cycle</div>
              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>Section A · Regular Mode</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Enrollment Standing</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} /> Active &amp; Good Standing
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>Semester 5 in Progress (CGPA 8.42)</div>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={20} color="#2563eb" />
                  <span>Semester Progression Register</span>
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Full historical enrollment trail preserved across progression cycles
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                {loadingEnrollments ? 'Connecting...' : `${enrollments.length > 0 ? enrollments.length : 5} Semesters Recorded`}
              </span>
            </div>

            <div className="attendance-table-wrap" style={{ margin: 0 }}>
              <table className="attendance-summary-table">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Academic Session</th>
                    <th>Section</th>
                    <th>Term SGPA</th>
                    <th>Cumulative CGPA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(enrollments.length > 0 ? enrollments : [
                    { id: 'e1', semester: 'Semester 1', academicYear: '2023-2024', section: 'A', sgpa: 8.14, cgpa: 8.14, status: 'COMPLETED' },
                    { id: 'e2', semester: 'Semester 2', academicYear: '2023-2024', section: 'A', sgpa: 8.42, cgpa: 8.28, status: 'COMPLETED' },
                    { id: 'e3', semester: 'Semester 3', academicYear: '2024-2025', section: 'A', sgpa: 8.56, cgpa: 8.37, status: 'COMPLETED' },
                    { id: 'e4', semester: 'Semester 4', academicYear: '2024-2025', section: 'A', sgpa: 8.60, cgpa: 8.43, status: 'COMPLETED' },
                    { id: 'e5', semester: 'Semester 5', academicYear: '2025-2026', section: 'A', sgpa: null, cgpa: 8.42, status: 'ACTIVE' },
                  ]).map((item) => (
                    <tr key={item.id || item.semester}>
                      <td style={{ fontWeight: 700, color: '#1e293b' }}>{item.semester}</td>
                      <td>{item.academicYear}</td>
                      <td>{item.section || 'A'}</td>
                      <td style={{ fontWeight: 600 }}>{item.sgpa ? Number(item.sgpa).toFixed(2) : 'Awaiting exam'}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.cgpa ? Number(item.cgpa).toFixed(2) : '8.42'}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: item.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                          color: item.status === 'ACTIVE' ? '#15803d' : '#475569',
                          border: item.status === 'ACTIVE' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                        }}>
                          {item.status === 'ACTIVE' && <CheckCircle2 size={11} />}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYLLABUS */}
      {activeTab === 'syllabus' && (
        <div className="syllabus-grid">
          {[
            { code: 'CS501', name: 'Artificial Intelligence', size: '2.4 MB' },
            { code: 'CS502', name: 'Machine Learning', size: '1.8 MB' },
            { code: 'CS503', name: 'Cloud Computing', size: '3.1 MB' },
            { code: 'CS504', name: 'Compiler Design', size: '2.0 MB' },
          ].map((item) => (
            <div className="syllabus-card" key={item.code}>
              <div className="syllabus-card-icon"><FileText size={22} /></div>
              <div className="syllabus-card-copy">
                <strong>{item.name}</strong>
                <small>{item.code} · {item.size}</small>
              </div>
              <button className="syllabus-download-btn" onClick={() => downloadSyllabusPdf(item)}>
                <Download size={14} />Download
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: UPLOAD NOTES FROM ACADEMICS PAGE */}
      {showUploadModal && (
        <div className="academics-modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="academics-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="academics-modal-close" onClick={() => setShowUploadModal(false)}>×</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', background: '#e0e7ff', color: '#4338ca', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UploadCloud size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>Upload Class Notes</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Share handwritten notes for {selectedSubjectName}</p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label className="academic-form-label">Selected Subject</label>
                <select
                  className="academic-form-input"
                  value={selectedSubjectName}
                  onChange={(e) => setSelectedSubjectName(e.target.value)}
                >
                  <option value="Artificial Intelligence">Artificial Intelligence (CS501)</option>
                  <option value="Machine Learning">Machine Learning (CS502)</option>
                  <option value="Cloud Computing">Cloud Computing (CS503)</option>
                  <option value="Compiler Design">Compiler Design (CS504)</option>
                  <option value="Operating Systems">Operating Systems (CS401)</option>
                  <option value="Data Structures">Data Structures (CS302)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="academic-form-label">Lecture Date <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="date"
                    className="academic-form-input"
                    value={uploadForm.date}
                    onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="academic-form-label">Topic / Unit Covered <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="text"
                    className="academic-form-input"
                    value={uploadForm.topic}
                    onChange={(e) => setUploadForm({ ...uploadForm, topic: e.target.value })}
                    placeholder="e.g. Heuristic Search & A* Algorithm"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="academic-form-label">Notes Summary / Remarks</label>
                <textarea
                  className="academic-form-input"
                  rows={2}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="e.g. Class lecture diagrams and step-by-step solved examples..."
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="academic-form-label">Attach File / Photo Screenshot <span style={{ color: '#dc2626' }}>*</span></label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '16px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}>
                  <input
                    type="file"
                    id="acad-note-file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="acad-note-file" style={{ cursor: 'pointer', display: 'block' }}>
                    <UploadCloud size={30} style={{ color: '#4338ca', marginBottom: '4px' }} />
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                      {selectedFile ? selectedFile.name : 'Click to select class notes file'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                      Supported formats: JPG, PNG, WEBP, PDF · Max 10MB
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" className="btn-academic-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-academic-primary">
                  Upload Notes ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW SINGLE NOTE */}
      {viewingNote && (
        <div className="academics-modal-backdrop" onClick={() => setViewingNote(null)}>
          <div className="academics-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <button className="academics-modal-close" onClick={() => setViewingNote(null)}>×</button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <span className="note-subject-tag">{viewingNote.subject}</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: '#0f172a' }}>{viewingNote.topic}</h3>
                <small style={{ color: '#64748b' }}>Date: {viewingNote.date} · Uploaded by {viewingNote.uploadedBy?.name}</small>
              </div>
              {viewingNote.isFacultyVerified ? (
                <span className="academic-badge-verified"><ShieldCheck size={13} /> ✓ Faculty Verified</span>
              ) : (
                <span className="academic-badge-pending">Student Uploaded</span>
              )}
            </div>

            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '12px', textAlign: 'center', marginBottom: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {viewingNote.fileType === 'application/pdf' ? (
                <div style={{ padding: '24px', color: '#ffffff' }}>
                  <FileText size={48} style={{ color: '#818cf8', marginBottom: '8px' }} />
                  <div><strong>{viewingNote.fileName || 'Class_Notes.pdf'}</strong></div>
                  <a href={viewingNote.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontSize: '0.8rem', marginTop: '6px', display: 'inline-block' }}>Open PDF in New Window ↗</a>
                </div>
              ) : (
                <img
                  src={viewingNote.fileUrl}
                  alt="Class Note"
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '6px' }}
                />
              )}
            </div>

            <p style={{ fontSize: '0.86rem', color: '#334155', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              {viewingNote.description}
            </p>

            <div style={{ textAlign: 'right' }}>
              <button type="button" className="btn-academic-secondary" onClick={() => setViewingNote(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
