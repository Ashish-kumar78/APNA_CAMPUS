import React, { useEffect, useState } from 'react'
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
  MessageSquare,
  Printer
} from 'lucide-react'
import { downloadSyllabusPdf, downloadGiftAdmitCardPdf, openGiftAdmitCardPdf } from '../utils/pdfGenerator'
import { notesApi } from '../services/notesApi'
import { api } from '../services/api'
import ClassNotesPage from './ClassNotesPage.jsx'
import './AcademicsPage.css'

export const defaultAdmitCardExams = [
  {
    id: 'exam-4',
    num: 1,
    name: '4th Semester End Semester Examination 2025-26',
    venue: 'Apna Campus',
    batch: 'BTECH 2028-P',
    semesterLabel: '4th Semester',
    subjects: [
      { sl: 1, date: '06-05-2026', dateFull: '06/05/2026 (Wednesday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTCS-T-PC-403', name: 'Programming with Python', section: 'CSE - Genius' },
      { sl: 2, date: '07-05-2026', dateFull: '07/05/2026 (Thursday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTCS-T-PC-402', name: 'Computer Organization & Architecture', section: 'CSE - Genius' },
      { sl: 3, date: '08-05-2026', dateFull: '08/05/2026 (Friday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTCS-T-PC-401', name: 'Design and Analysis of Algorithms', section: 'CSE - Genius' },
      { sl: 4, date: '09-05-2026', dateFull: '09/05/2026 (Saturday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTEC-T-OE-401', name: 'Digital Signal Processing', section: 'CSE - Genius' },
      { sl: 5, date: '11-05-2026', dateFull: '11/05/2026 (Monday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTBS-T-HS-302', name: 'Engineering Economics', section: 'CSE - Genius' },
      { sl: 6, date: '12-05-2026', dateFull: '12/05/2026 (Tuesday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTMC-T-MC-302', name: 'EIKT', section: 'CSE - Genius' },
      { sl: 7, date: '13-05-2026', dateFull: '13/05/2026 (Wednesday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTSC-T-AE-401', name: 'Ability Enhancement Training -C', section: 'CSE - Genius' },
    ]
  },
  {
    id: 'exam-3',
    num: 2,
    name: '3rd Semester End Semester Examination 2025-26',
    venue: 'Apna Campus',
    batch: 'BTECH 2028-P',
    semesterLabel: '3rd Semester',
    subjects: [
      { sl: 1, date: '15-12-2025', dateFull: '15/12/2025 (Monday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTCS-T-PC-301', name: 'Discrete Mathematics', section: 'CSE - Genius' },
      { sl: 2, date: '17-12-2025', dateFull: '17/12/2025 (Wednesday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTCS-T-PC-302', name: 'Data Structures', section: 'CSE - Genius' },
      { sl: 3, date: '19-12-2025', dateFull: '19/12/2025 (Friday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTCS-T-PC-303', name: 'Object Oriented Programming with Java', section: 'CSE - Genius' },
      { sl: 4, date: '22-12-2025', dateFull: '22/12/2025 (Monday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTES-T-ES-301', name: 'Digital Electronics', section: 'CSE - Genius' },
      { sl: 5, date: '24-12-2025', dateFull: '24/12/2025 (Wednesday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTHS-T-HS-301', name: 'Organizational Behavior', section: 'CSE - Genius' },
    ]
  },
  {
    id: 'exam-2',
    num: 3,
    name: '2nd Semester End Semester Examination (Regular), 2024-25',
    venue: 'Apna Campus',
    batch: 'BTECH 2028-P',
    semesterLabel: '2nd Semester',
    subjects: [
      { sl: 1, date: '10-05-2025', dateFull: '10/05/2025 (Saturday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTBS-T-BS-201', name: 'Engineering Mathematics - II', section: 'CSE - Genius' },
      { sl: 2, date: '12-05-2025', dateFull: '12/05/2025 (Monday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTBS-T-BS-202', name: 'Engineering Chemistry', section: 'CSE - Genius' },
      { sl: 3, date: '14-05-2025', dateFull: '14/05/2025 (Wednesday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTES-T-ES-201', name: 'Basic Electrical Engineering', section: 'CSE - Genius' },
      { sl: 4, date: '16-05-2025', dateFull: '16/05/2025 (Friday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTCS-T-PC-201', name: 'Programming in C', section: 'CSE - Genius' },
    ]
  },
  {
    id: 'exam-1',
    num: 4,
    name: 'End Semester Examination of 1st Semester B. Tech: 2024-25',
    venue: 'Apna Campus',
    batch: 'BTECH 2028-P',
    semesterLabel: '1st Semester',
    subjects: [
      { sl: 1, date: '18-12-2024', dateFull: '18/12/2024 (Wednesday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTBS-T-BS-101', name: 'Engineering Mathematics - I', section: 'CSE - Genius' },
      { sl: 2, date: '20-12-2024', dateFull: '20/12/2024 (Friday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTBS-T-BS-102', name: 'Engineering Physics', section: 'CSE - Genius' },
      { sl: 3, date: '23-12-2024', dateFull: '23/12/2024 (Monday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTES-T-ES-101', name: 'Basic Electronics Engineering', section: 'CSE - Genius' },
      { sl: 4, date: '26-12-2024', dateFull: '26/12/2024 (Thursday)', sitting: '2', time: '12.00 PM - 03.00 PM', code: 'BTHS-T-HS-101', name: 'Communicative English', section: 'CSE - Genius' },
    ]
  }
];

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

export default function AcademicsPage({ account }) {
  const [openSemester, setOpenSemester] = useState(0)
  const [activeTab, setActiveTab] = useState('subjects')
  const [classNotes, setClassNotes] = useState([])

  // Student Identity for Admit Card & Academics
  const studentDetails = {
    name: (account?.name || 'BISHNU PRASAD SAHOO').toUpperCase(),
    rollNumber: account?.rollNumber || account?.registrationNumber || '2401432265',
    registrationNumber: '2401432265',
    dobFormatted: '04/03/2007',
    dob: '2007-03-04',
    batch: 'BTECH 2028-P',
    courseBatch: 'BTECH 2028-P',
    courseBatchFull: 'BTECH 2028-P (Branch:- Computer Science & Engineering (Artificial Intelligence))',
    section: 'CSE - Genius'
  }

  // Admit Card States (Matches User Images 2, 3, 4, 5)
  const [admitExams] = useState(defaultAdmitCardExams)
  const [expandedExamId, setExpandedExamId] = useState('exam-4') // 4th Semester expanded by default matching Image 3
  const [filterExamName, setFilterExamName] = useState('')
  const [filterExamVenue, setFilterExamVenue] = useState('')
  const [filterBatch, setFilterBatch] = useState('')
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false)
  const [selectedExamForAction, setSelectedExamForAction] = useState(defaultAdmitCardExams[0])
  const [showDocPreviewModal, setShowDocPreviewModal] = useState(false)

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

  const filteredAdmitExams = admitExams.filter((exam) => {
    const matchName = !filterExamName || exam.name.toLowerCase().includes(filterExamName.toLowerCase())
    const matchVenue = !filterExamVenue || exam.venue.toLowerCase().includes(filterExamVenue.toLowerCase())
    const matchBatch = !filterBatch || exam.batch.toLowerCase().includes(filterBatch.toLowerCase())
    return matchName && matchVenue && matchBatch
  })

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
          <p className="academics-kicker"><BookOpen size={13} /> ACADEMIC RECORD & COURSES</p>
          <h2>Academics</h2>
          <p className="academics-caption">Courses, syllabus, academic curriculum & admit card access.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
          { id: 'progression', label: 'Programme & Term History' },
          { id: 'notes', label: 'Class Notes Sharing', count: classNotes.length },
          { id: 'admit-card', label: 'Download Admit Card' }
        ].map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="tab-pill-badge">{tab.count}</span>
            )}
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
                                    <button
                                      type="button"
                                      className="btn-sub-notes-badge verified"
                                      title="View verified class notes for this subject"
                                      onClick={() => {
                                        setSelectedSubjectName(sub.name)
                                        setActiveTab('notes')
                                      }}
                                    >
                                      <ShieldCheck size={12} /> {verifiedCount} Verified
                                    </button>
                                  ) : matchingNotes.length > 0 ? (
                                    <button
                                      type="button"
                                      className="btn-sub-notes-badge"
                                      title="View class notes for this subject"
                                      onClick={() => {
                                        setSelectedSubjectName(sub.name)
                                        setActiveTab('notes')
                                      }}
                                    >
                                      {matchingNotes.length} Notes
                                    </button>
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

      {/* TAB 4: CLASS NOTES SHARING (Full Interactive Portal) */}
      {activeTab === 'notes' && (
        <div className="academics-notes-portal-wrap">
          <ClassNotesPage
            account={account}
            initialSubject={selectedSubjectName}
            onNotesUpdated={loadClassNotes}
          />
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


      {/* TAB 5: DOWNLOAD ADMIT CARD (Matches User Images 2 & 3) */}
      {activeTab === 'admit-card' && (
        <div className="admit-card-container">
          {/* Header matching Image 2 */}
          <div className="admit-section-header">
            <div className="admit-header-title">
              <span className="admit-header-icon-wrap" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="8" height="8" rx="1.5" />
                  <rect x="14" y="2" width="8" height="8" rx="1.5" />
                  <rect x="2" y="14" width="8" height="8" rx="1.5" />
                  <rect x="14" y="14" width="8" height="8" rx="1.5" />
                </svg>
              </span>
              <h3>Admit Card Download</h3>
            </div>
          </div>

          {/* Main Table Card (Image 2 & 3) */}
          <div className="admit-table-card">
            <div className="admit-table-responsive">
              <table className="admit-main-table">
                <thead>
                  <tr className="admit-head-row">
                    <th style={{ width: '44px' }}></th>
                    <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                    <th style={{ width: '42%' }}>Examination Name</th>
                    <th style={{ width: '32%' }}>Examination Venue</th>
                    <th style={{ width: '20%' }}>Batch</th>
                  </tr>
                  {/* Filter inputs row directly below headers */}
                  <tr className="admit-filter-row">
                    <th></th>
                    <th></th>
                    <th>
                      <input
                        type="text"
                        className="admit-filter-input"
                        placeholder=""
                        value={filterExamName}
                        onChange={(e) => setFilterExamName(e.target.value)}
                      />
                    </th>
                    <th>
                      <input
                        type="text"
                        className="admit-filter-input"
                        placeholder=""
                        value={filterExamVenue}
                        onChange={(e) => setFilterExamVenue(e.target.value)}
                      />
                    </th>
                    <th>
                      <select
                        className="admit-filter-input admit-filter-select"
                        value={filterBatch}
                        onChange={(e) => setFilterBatch(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="BTECH 2028-P">BTECH 2028-P</option>
                      </select>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmitExams.map((exam) => {
                    const isExpanded = expandedExamId === exam.id

                    return (
                      <React.Fragment key={exam.id}>
                        <tr className={`admit-exam-row ${isExpanded ? 'row-expanded' : ''}`}>
                          <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '10px' }}>
                            <button
                              type="button"
                              className="btn-admit-toggle"
                              onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                              title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                              {isExpanded ? (
                                <span className="admit-toggle-box minus">
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <rect x="2" y="2" width="20" height="20" rx="3" fill="#ffffff" />
                                    <line x1="6" y1="12" x2="18" y2="12" stroke="#0f172a" strokeWidth="3" />
                                  </svg>
                                </span>
                              ) : (
                                <span className="admit-toggle-box play">
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="2" width="20" height="20" rx="3" fill="#ffffff" />
                                    <polygon points="9,7 17,12 9,17" fill="#0f172a" />
                                  </svg>
                                </span>
                              )}
                            </button>
                            {isExpanded && (
                              <div style={{ marginTop: '3px' }}>
                                <button
                                  type="button"
                                  className="btn-admit-collapse-tag"
                                  onClick={() => setExpandedExamId(null)}
                                >
                                  Collapse
                                </button>
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '11px', fontWeight: 600 }}>
                            {exam.num}
                          </td>
                          <td style={{ verticalAlign: 'top', paddingTop: '11px' }}>
                            <span className="exam-name-text">{exam.name}</span>
                          </td>
                          <td style={{ verticalAlign: 'top', paddingTop: '11px', color: '#334155' }}>
                            {exam.venue}
                          </td>
                          <td style={{ verticalAlign: 'top', paddingTop: '11px', color: '#334155' }}>
                            {exam.batch}
                          </td>
                        </tr>

                        {/* Expanded Section with Cyan Top Border Line (Image 3) */}
                        {isExpanded && (
                          <tr className="admit-expanded-row">
                            <td colSpan={5} className="admit-expanded-cell">
                              <div className="admit-schedule-box">
                                <div className="admit-schedule-table-wrap">
                                  <table className="admit-schedule-table">
                                    <thead>
                                      <tr>
                                        <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                                        <th style={{ width: '13%' }}>Date/Time</th>
                                        <th style={{ width: '8%', textAlign: 'center' }}>Sitting</th>
                                        <th style={{ width: '18%' }}>Time From and To</th>
                                        <th style={{ width: '15%' }}>Subject Code</th>
                                        <th style={{ width: '27%' }}>Subject Name</th>
                                        <th style={{ width: '14%' }}>Section/House</th>
                                        <th style={{ width: '50px', textAlign: 'center' }}></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {exam.subjects.map((sub) => (
                                        <tr key={sub.sl}>
                                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{sub.sl}</td>
                                          <td>{sub.date}</td>
                                          <td style={{ textAlign: 'center' }}>{sub.sitting}</td>
                                          <td>{sub.time}</td>
                                          <td><code className="admit-sub-code">{sub.code}</code></td>
                                          <td><span className="admit-sub-name">{sub.name}</span></td>
                                          <td>{sub.section}</td>
                                          <td style={{ textAlign: 'center' }}>
                                            <button
                                              type="button"
                                              className="btn-admit-row-print"
                                              title="Download / Print Admit Card"
                                              onClick={() => {
                                                setSelectedExamForAction(exam)
                                                setShowDownloadConfirm(true)
                                              }}
                                            >
                                              <Printer size={15} color="#0284c7" />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {filteredAdmitExams.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        No examination records found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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

      {/* ── MODAL 3: DOWNLOAD ADMIT CARD CONFIRMATION (Image 4) ── */}
      {showDownloadConfirm && (
        <div className="admit-confirm-backdrop" onClick={() => setShowDownloadConfirm(false)}>
          <div className="admit-confirm-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="admit-confirm-close-btn"
              onClick={() => setShowDownloadConfirm(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="admit-confirm-text">
              Are you sure you want to download this admitcard?
            </div>
            <div className="admit-confirm-actions">
              <button
                type="button"
                className="btn-admit-modal-cancel"
                onClick={() => setShowDownloadConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-admit-modal-ok"
                onClick={() => {
                  setShowDownloadConfirm(false)
                  downloadGiftAdmitCardPdf(selectedExamForAction, studentDetails)
                  setShowDocPreviewModal(true)
                  showToast(`Admit card for ${selectedExamForAction.name} downloaded successfully!`)
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: AUTHENTIC ADMIT CARD DOCUMENT PREVIEW & PRINT (Image 5) ── */}
      {showDocPreviewModal && selectedExamForAction && (
        <div className="admit-doc-backdrop" onClick={() => setShowDocPreviewModal(false)}>
          <div className="admit-doc-card" onClick={(e) => e.stopPropagation()}>
            {/* Top Toolbar */}
            <div className="admit-doc-toolbar no-print">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-official-verified">✓ Official Apna Campus Autonomous Document</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Ready for print &amp; official archival</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-toolbar-print"
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> Print Admit Card
                </button>
                <button
                  type="button"
                  className="btn-toolbar-download"
                  onClick={() => {
                    downloadGiftAdmitCardPdf(selectedExamForAction, studentDetails)
                    showToast('PDF downloaded successfully!')
                  }}
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  type="button"
                  className="btn-toolbar-close"
                  onClick={() => setShowDocPreviewModal(false)}
                >
                  <X size={15} /> Close
                </button>
              </div>
            </div>

            {/* Printable Paper (A4 Style - Matches Image 5 Exactly) */}
            <div className="admit-paper-sheet printable-admit-sheet">
              {/* Central Watermark */}
              <div className="admit-paper-watermark" aria-hidden="true">
                <img src="/logo.png" alt="Apna Campus Watermark" />
              </div>

              {/* Sheet Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header: Logo and Title */}
                <div className="admit-paper-header">
                  <div className="admit-paper-logo">
                    <img src="/logo.png" alt="Apna Campus Logo" />
                  </div>
                  <div className="admit-paper-titles">
                    <h2>APNA CAMPUS, BHUBANESWAR</h2>
                    <h3 className="admit-card-title-underlined">ADMIT CARD</h3>
                    <h4>{selectedExamForAction.name}</h4>
                  </div>
                </div>

                {/* Candidate Details & Photo */}
                <div className="admit-paper-candidate-row">
                  <table className="admit-candidate-table">
                    <tbody>
                      <tr>
                        <td className="candidate-field-label">Registration No.</td>
                        <td className="candidate-field-val">- {studentDetails.registrationNumber}</td>
                      </tr>
                      <tr>
                        <td className="candidate-field-label">Candidate's Name</td>
                        <td className="candidate-field-val">- {studentDetails.name}</td>
                      </tr>
                      <tr>
                        <td className="candidate-field-label">Date of Birth</td>
                        <td className="candidate-field-val">- {studentDetails.dobFormatted}</td>
                      </tr>
                      <tr>
                        <td className="candidate-field-label">Course/Batch</td>
                        <td className="candidate-field-val">- {studentDetails.courseBatchFull}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="admit-candidate-photo-box">
                    <div className="candidate-photo-frame">
                      <img
                        src="/candidate_photo_apna.png"
                        alt="Candidate"
                        onError={(e) => { e.target.src = '/candidate_photo_bishnu.png' }}
                      />
                    </div>
                    <div className="candidate-sig-label">Candidate's Signature</div>
                  </div>
                </div>

                {/* Centered Schedule Subtitle */}
                <div className="admit-paper-schedule-title">
                  Schedule of Examination
                </div>

                {/* Schedule Table */}
                <table className="admit-paper-sched-table">
                  <thead>
                    <tr>
                      <th style={{ width: '8%', textAlign: 'center' }}>Sl.</th>
                      <th style={{ width: '28%', textAlign: 'center' }}>Date</th>
                      <th style={{ width: '12%', textAlign: 'center' }}>Sitting</th>
                      <th style={{ width: '22%', textAlign: 'center' }}>Time</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>Subject Code</th>
                      <th style={{ width: '35%', textAlign: 'left' }}>Subject Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedExamForAction.subjects.map((s) => (
                      <tr key={s.sl}>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s.sl}</td>
                        <td style={{ textAlign: 'center' }}>{s.dateFull || s.date}</td>
                        <td style={{ textAlign: 'center' }}>{s.sitting}nd</td>
                        <td style={{ textAlign: 'center' }}>{s.time}</td>
                        <td style={{ textAlign: 'center' }}>{s.code}</td>
                        <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{s.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Signatures & Stamps Row */}
                <div className="admit-paper-signatures-row">
                  <div className="admit-sig-block">
                    <img
                      src="/admit_sig_center_sup.png"
                      alt="Center Superintendent Signature"
                      className="admit-sig-img"
                    />
                    <div className="admit-stamp-box">
                      <div className="stamp-title">Center Superintendent</div>
                      <div className="stamp-sub">Apna Campus, Bhubaneswar</div>
                    </div>
                  </div>

                  <div className="admit-sig-block right">
                    <img
                      src="/admit_sig_controller.png"
                      alt="Controller Signature"
                      className="admit-sig-img"
                    />
                    <div className="admit-stamp-box">
                      <div className="stamp-title">Controller of Examinations</div>
                      <div className="stamp-sub">Apna Campus (Autonomous), Bhubaneswar</div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="admit-paper-instructions">
                  <div className="instructions-title">*Instruction (s)</div>
                  <ol className="instructions-list">
                    <li>This Admit Card is issued on the basis of student data filled in on-line by the college.</li>
                    <li>A Candidate is required to bring his / her Registration / Identity Card and Identity Proof to the Examination Hall.</li>
                    <li>A Candidate detected with possession of Mobile Phone / Pager and any Objectionable Electronic Gadgets inside the Examination Hall will be debarred and punishable as per Regulation of the University.</li>
                    <li>A candidate shall report the Invigilator and / Centre Superintendent in case of wrong photograph or discrepancies and the Centre Superintendent shall permit only after verification with the University Registration Card and valid Vote Id / Aadhar Card.</li>
                    <li>The Centre Superintendent shall permit a candidate to appear in subject (s), if he / she has registered, eligible and subject (s) are available in the University Schedule and Admit Card.</li>
                    <li>The Centre Superintendent shall make permissible arrangement for physically challenged / blind candidates with required supporting documents as per rules.</li>
                    <li>The Result will be published subject to fulfilment of all academic regulations for the course in force of the university.</li>
                  </ol>
                </div>

                {/* Footer Divider & Text */}
                <div className="admit-paper-footer">
                  <span>Apna Campus</span>
                  <span>Printed @ 18-10-2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
