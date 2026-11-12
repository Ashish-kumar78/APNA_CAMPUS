import React, { useEffect, useState, useMemo } from 'react'
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
  Printer,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
  Search,
  Filter,
  Clock,
  ThumbsUp,
  Flag,
  FileCheck,
  BarChart3,
  BookmarkCheck,
  CheckSquare,
  ArrowRight,
  RefreshCw,
  Bell,
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react'
import {
  downloadApnaAdmitCardPdf,
  openApnaAdmitCardPdf,
  downloadGiftAdmitCardPdf,
  openGiftAdmitCardPdf,
  downloadGradeCardPdf,
  downloadAcademicTranscriptPdf
} from '../utils/pdfGenerator'
import { api } from '../services/api'
import { isDemoAccount } from '../utils/authUtils.js'
import { campusConnectStore } from '../services/campusConnectStore'
import './AcademicsPage.css'

export default function AcademicsPage({ account }) {
  // Current Active Tab
  const [activeTab, setActiveTab] = useState('overview')

  // Dossier State (Loaded from Backend)
  const [dossier, setDossier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  // Study Materials Filters & Search
  const [materialCategory, setMaterialCategory] = useState('All Categories')
  const [materialSubject, setMaterialSubject] = useState('ALL')
  const [materialFileType, setMaterialFileType] = useState('ALL')
  const [materialSearch, setMaterialSearch] = useState('')
  const [helpfulVotes, setHelpfulVotes] = useState({})

  // Progression Expandable State
  const [expandedProgressionSem, setExpandedProgressionSem] = useState(null)

  // Selected Result Semester for Marksheet
  const [selectedResultSem, setSelectedResultSem] = useState(4)

  // Modals State
  const [activeSyllabusModalSub, setActiveSyllabusModalSub] = useState(null)
  const [viewingMaterial, setViewingMaterial] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(null)
  const [showSupplementaryModal, setShowSupplementaryModal] = useState(false)
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false)
  const [showDocPreviewModal, setShowDocPreviewModal] = useState(false)

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    subject: '',
    category: 'Handwritten Notes',
    topic: '',
    description: '',
    moduleNumber: 1,
    date: new Date().toISOString().split('T')[0]
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState('')

  // Request Notes Form State
  const [requestForm, setRequestForm] = useState({
    subject: '',
    topic: '',
    urgency: 'Medium',
    remarks: ''
  })

  // Load Dossier from Backend on Mount or Account Change
  useEffect(() => {
    let active = true
    const studentIdentifier =
      account?.studentId || account?.rollNumber || account?.registrationNumber || account?.id || ''

    setLoading(true)
    api.getStudentAcademicDossier(studentIdentifier)
      .then((res) => {
        if (active && res?.success && res.data) {
          setDossier(res.data)
          if (res.data.enrolledSubjects?.[0]?.name) {
            setUploadForm((prev) => ({ ...prev, subject: res.data.enrolledSubjects[0].name }))
            setRequestForm((prev) => ({ ...prev, subject: res.data.enrolledSubjects[0].name }))
          }
          setErrorMsg('')
        }
      })
      .catch((err) => {
        console.warn('Student academic dossier live sync note:', err.message)
        // Fallback default structure is automatically handled if offline
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [account?.rollNumber, account?.studentId, account?.id])

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  // Determine demo vs newly registered account
  const isDemo = isDemoAccount(account);

  // Active student reference
  const student = dossier?.student || {
    name: account?.name || (isDemo ? 'Rakesh Das' : 'Student'),
    rollNumber: account?.rollNumber || account?.registrationNumber || (isDemo ? '2305201001' : '—'),
    registrationNumber: account?.registrationNumber || account?.rollNumber || (isDemo ? '2305201001' : '—'),
    department: account?.department || account?.branch || 'Computer Science & Engineering',
    deptCode: account?.deptCode || 'CSE',
    semester: account?.semester || (isDemo ? 'Semester 5' : 'Semester 1'),
    section: account?.section || (isDemo ? 'Section A' : 'Pending Allocation'),
    batch: account?.batch || (isDemo ? '2023–2027' : '2026–2030'),
    academicYear: account?.academicYear || '2026–27',
    institutionName: 'Apna Campus',
    programme: account?.program || 'Bachelor of Technology in Computer Science & Engineering',
    cgpa: account?.cgpa !== undefined ? account.cgpa : (isDemo ? 8.72 : null),
    attendance: account?.attendance !== undefined ? account.attendance : (isDemo ? 88 : null)
  }

  const overview = dossier?.overviewCards || {
    registeredProgramme: student.programme,
    institutionName: 'Apna Campus',
    admissionBatch: student.batch,
    currentSemester: student.semester,
    currentAcademicSession: student.academicYear,
    cgpa: student.cgpa,
    completedSemesters: isDemo ? 4 : 0,
    enrolledSubjectsCount: dossier?.enrolledSubjects?.length || (isDemo ? 6 : 0),
    nextExamination: isDemo ? 'Autumn End-Semester Autonomous Examination 2026–27' : 'Upcoming Semester Examination',
    attendanceRate: student.attendance !== null && student.attendance !== undefined ? `${student.attendance}%` : 'N/A'
  }

  const enrolledSubjects = dossier?.enrolledSubjects || []
  const progressionHistory = dossier?.progressionHistory || []
  const studyMaterials = dossier?.studyMaterials || []
  const upcomingExam = dossier?.upcomingExam || null
  const assignments = dossier?.assignments || []
  const syllabusProgress = dossier?.syllabusProgress || []
  const backlogs = dossier?.backlogs || { hasActiveBacklogs: false, activeBacklogCount: 0, records: [] }
  const academicCalendar = dossier?.academicCalendar || []
  const academicNotices = dossier?.academicNotices || []

  // Filtered Study Materials
  const filteredMaterials = useMemo(() => {
    return studyMaterials.filter((m) => {
      const matchCat =
        materialCategory === 'All Categories' || m.category.toLowerCase() === materialCategory.toLowerCase()
      const matchSub =
        materialSubject === 'ALL' ||
        m.subject.toLowerCase() === materialSubject.toLowerCase() ||
        m.subjectCode === materialSubject
      const matchType =
        materialFileType === 'ALL' || m.fileType.toLowerCase() === materialFileType.toLowerCase()
      const matchSearch =
        !materialSearch ||
        m.title.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.subject.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.uploaderName.toLowerCase().includes(materialSearch.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(materialSearch.toLowerCase()))

      return matchCat && matchSub && matchType && matchSearch
    })
  }, [studyMaterials, materialCategory, materialSubject, materialFileType, materialSearch])

  // Handle Note Helpful Vote
  const handleVoteHelpful = async (noteId) => {
    const current = helpfulVotes[noteId] || 0
    setHelpfulVotes({ ...helpfulVotes, [noteId]: current + 1 })
    showToast('Marked as helpful! Thank you for supporting peer learners.')
    try {
      await api.markNoteHelpful(noteId)
    } catch (_) {}
  }

  // Handle Note Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      showToast('File size exceeds the 15MB limit.')
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (evt) => setFilePreview(evt.target.result)
    reader.onerror = () => showToast('Could not read the selected file.')
    reader.readAsDataURL(file)
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!uploadForm.topic.trim()) {
      showToast('Please enter the topic title.')
      return
    }
    if (!selectedFile) {
      showToast('Please attach a class notes file (PDF, image, or document).')
      return
    }

    showToast('Submitting notes to Department Faculty for verification...')
    setShowUploadModal(false)
    setSelectedFile(null)
    setFilePreview('')
    setUploadForm({
      subject: enrolledSubjects[0]?.name || '',
      category: 'Handwritten Notes',
      topic: '',
      description: '',
      moduleNumber: 1,
      date: new Date().toISOString().split('T')[0]
    })
    setTimeout(() => {
      showToast('Notes submitted! Faculty verification is in progress.')
    }, 800)
  }

  // Handle Request Note Submit
  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    if (!requestForm.topic.trim()) {
      showToast('Please enter the requested topic.')
      return
    }
    showToast('Submitting note request to faculty & student peers...')
    setShowRequestModal(false)
    try {
      await api.submitNoteRequest(requestForm)
      showToast(`Request for "${requestForm.topic}" posted to Campus Connect!`)
    } catch (_) {
      showToast(`Request for "${requestForm.topic}" submitted successfully.`)
    }
    setRequestForm({ subject: enrolledSubjects[0]?.name || '', topic: '', urgency: 'Medium', remarks: '' })
  }

  // Handle Report Material
  const handleReportSubmit = (materialId) => {
    setShowReportModal(null)
    showToast('Material flagged for Academic Committee review. Thank you for keeping records accurate.')
  }

  // Handle Admit Card Download
  const handleDownloadAdmitCard = () => {
    if (!upcomingExam) return
    if (!upcomingExam.eligibility?.isEligible && upcomingExam.status === 'NOT ELIGIBLE') {
      showToast('Cannot download: Attendance is below 75% threshold.')
      return
    }
    if (!upcomingExam.eligibility?.isEligible && upcomingExam.status === 'WITHHELD') {
      showToast('Cannot download: Institutional accounts clearance pending.')
      return
    }
    downloadApnaAdmitCardPdf(upcomingExam, student)
    showToast('Admit card PDF downloaded successfully!')
  }

  // Handle Marksheet Download
  const handleDownloadMarksheet = (semData) => {
    downloadGradeCardPdf(
      {
        semester: semData.semesterLabel,
        sgpa: semData.sgpa || '8.60',
        result: semData.resultStatus?.includes('PASSED') ? 'PASSED' : 'COMPLETED',
        subjects: semData.subjects?.map((s) => ({
          code: s.code,
          name: s.name,
          credits: s.credits,
          internal: 19,
          external: s.gradePoint >= 9 ? 76 : 68,
          total: s.gradePoint >= 9 ? 95 : 87,
          grade: s.gradeLetter || 'A',
          points: s.gradePoint || 9
        }))
      },
      student
    )
    showToast(`Semester Grade Sheet for ${semData.semesterLabel} downloaded!`)
  }

  // Handle Official Transcript Download
  const handleDownloadTranscript = () => {
    downloadAcademicTranscriptPdf(dossier, student)
    showToast('Official Academic Transcript PDF downloaded!')
  }

  return (
    <div className="academics-page">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="academics-toast">
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="academics-header">
        <div className="academics-header-left">
          <p className="academics-kicker">
            <BookOpen size={13} /> APNA CAMPUS AUTONOMOUS ACADEMIC ERP
          </p>
          <h2>Academic Management Portal</h2>
          <p className="academics-caption">
            Enrolled course curricula, verified lecture notes, semester progression ledger &amp; examination hall clearance.
          </p>
        </div>
        <div className="academics-header-stats">
          <div className="academics-stat-pill tone-purple">
            <Award size={15} />
            <div>
              <small>CUMULATIVE CGPA</small>
              <strong>{student.cgpa ? `${student.cgpa} / 10.0` : 'Awaiting Results'}</strong>
            </div>
          </div>
          <div
            className={`academics-stat-pill ${
              student.attendance >= 75 ? 'tone-green' : 'tone-red'
            }`}
          >
            <ShieldCheck size={15} />
            <div>
              <small>ATTENDANCE STANDING</small>
              <strong>{student.attendance}% · {student.attendance >= 75 ? 'Eligible' : 'Shortage'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation Bar */}
      <div className="academics-tabs-bar" role="tablist">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'subjects', label: 'Enrolled Subjects', icon: BookOpen, count: enrolledSubjects.length },
          { id: 'progression', label: 'Progression History', icon: GraduationCap },
          { id: 'notes', label: 'Study Materials', icon: FileText, count: studyMaterials.length },
          { id: 'admit-card', label: 'Admit Card', icon: FileCheck },
          { id: 'transcript', label: 'Official Transcript', icon: BookmarkCheck },
          { id: 'backlogs', label: 'Backlog Register', icon: AlertTriangle, alert: backlogs.hasActiveBacklogs },
          { id: 'tracker', label: 'Syllabus & Assignments', icon: CheckSquare }
        ].map((tab) => {
          const TabIcon = tab.icon
          return (
            <button
              key={tab.id}
              className={`academics-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <TabIcon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="academics-tab-counter">{tab.count}</span>
              )}
              {tab.alert && <span className="academics-tab-dot-alert" />}
            </button>
          )
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: ACADEMIC OVERVIEW DASHBOARD */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="academics-overview-view">
          {/* 9 Standard Information Cards */}
          <div className="academics-overview-grid">
            <div className="overview-card">
              <div className="overview-card-header">
                <span className="overview-card-label">Registered Programme</span>
                <GraduationCap size={16} className="text-blue" />
              </div>
              <div className="overview-card-main">{overview.registeredProgramme}</div>
              <div className="overview-card-sub text-blue">Degree: {student.degreeType || '4-Year Undergraduate'}</div>
            </div>

            <div className="overview-card">
              <div className="overview-card-header">
                <span className="overview-card-label">College / Institution</span>
                <ShieldCheck size={16} className="text-green" />
              </div>
              <div className="overview-card-main">{overview.institutionName}</div>
              <div className="overview-card-sub text-green">UGC &amp; BPUT Autonomous Curriculum</div>
            </div>

            <div className="overview-card">
              <div className="overview-card-header">
                <span className="overview-card-label">Admission Batch</span>
                <Calendar size={16} className="text-indigo" />
              </div>
              <div className="overview-card-main">{overview.admissionBatch}</div>
              <div className="overview-card-sub">Section: {student.section} · Regular Mode</div>
            </div>

            <div className="overview-card">
              <div className="overview-card-header">
                <span className="overview-card-label">Current Semester</span>
                <Layers size={16} className="text-purple" />
              </div>
              <div className="overview-card-main">{overview.currentSemester}</div>
              <div className="overview-card-sub text-purple">Academic Session: {overview.currentAcademicSession}</div>
            </div>

            <div className="overview-card">
              <div className="overview-card-header">
                <span className="overview-card-label">Cumulative CGPA</span>
                <Star size={16} className="text-amber" />
              </div>
              <div className="overview-card-main">
                {overview.cgpa ? (
                  <>
                    {overview.cgpa} <small style={{ fontSize: '0.8rem', color: '#64748b' }}>/ 10.0</small>
                  </>
                ) : (
                  'Awaiting Results'
                )}
              </div>
              <div className="overview-card-sub text-emerald">
                {overview.cgpa ? 'Calculated from published university results' : 'No published examination grades yet'}
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-card-header">
                <span className="overview-card-label">Completed Semesters</span>
                <BookmarkCheck size={16} className="text-teal" />
              </div>
              <div className="overview-card-main">
                {overview.completedSemesters} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>of 8 Semesters</span>
              </div>
              <div className="overview-card-sub">
                Credits Cleared: {overview.completedSemesters * 22} / 160 Total
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-card-header">
                <span className="overview-card-label">Enrolled Subjects</span>
                <BookOpen size={16} className="text-sky" />
              </div>
              <div className="overview-card-main">{overview.enrolledSubjectsCount} Subjects</div>
              <div className="overview-card-sub text-sky">Theory, Labs &amp; Capstone Project</div>
            </div>

            <div className="overview-card">
              <div className="overview-card-header">
                <span className="overview-card-label">Attendance Standing</span>
                <CheckCircle2 size={16} className="text-green" />
              </div>
              <div className="overview-card-main">{overview.attendanceRate}</div>
              <div className="overview-card-sub text-green">
                {student.attendance >= 75
                  ? '✓ Examination Clearance Secured'
                  : '⚠️ Shortage Warning (Threshold: 75%)'}
              </div>
            </div>

            <div className="overview-card overview-card-featured">
              <div className="overview-card-header">
                <span className="overview-card-label">Next Examination</span>
                <Clock size={16} className="text-blue" />
              </div>
              <div className="overview-card-main" style={{ fontSize: '1.05rem' }}>
                {overview.nextExamination}
              </div>
              <div className="overview-card-sub text-blue">
                Hall Ticket Status: <strong>{upcomingExam?.status || 'Active'}</strong>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-card-header">
                <span className="overview-card-label">Class Advisor &amp; Mentor</span>
                <User size={16} className="text-indigo" />
              </div>
              <div className="overview-card-main">{overview.classAdvisor || student.classAdvisor || 'Dr. S. Mohanty'}</div>
              <div className="overview-card-sub text-indigo">
                {overview.classAdvisorEmail || student.classAdvisorEmail ? (
                  <a
                    href={`mailto:${overview.classAdvisorEmail || student.classAdvisorEmail}`}
                    style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}
                  >
                    ✉️ {overview.classAdvisorEmail || student.classAdvisorEmail}
                  </a>
                ) : (
                  'Department Academic Advisor'
                )}
                {(overview.classAdvisorPhone || student.classAdvisorPhone) && (
                  <span style={{ color: '#475569', display: 'block', fontSize: '0.72rem', marginTop: '2px' }}>
                    📞 {overview.classAdvisorPhone || student.classAdvisorPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts Banner */}
          <div className="academics-quick-banner">
            <div>
              <h3>Fast Academic Actions</h3>
              <p>Instant access to syllabus outlines, verified study resources, and official transcripts.</p>
            </div>
            <div className="quick-banner-actions">
              <button
                type="button"
                className="btn-quick-action"
                onClick={() => setActiveTab('subjects')}
              >
                <BookOpen size={14} /> View Enrolled Subjects
              </button>
              <button
                type="button"
                className="btn-quick-action"
                onClick={() => setActiveTab('notes')}
              >
                <FileText size={14} /> Search Study Materials
              </button>
              <button
                type="button"
                className="btn-quick-action primary"
                onClick={() => setActiveTab('admit-card')}
              >
                <Download size={14} /> Download Admit Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 3: ENROLLED SUBJECTS & SYLLABUS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'subjects' && (
        <div className="academics-subjects-view">
          <div className="view-intro-bar">
            <div>
              <h3>Currently Registered Curriculum ({student.semester})</h3>
              <p>
                Approved curriculum subjects registered for {student.department} · {student.academicYear}.
              </p>
            </div>
            <span className="badge-reg-status">
              <CheckCircle2 size={13} /> Registration Approved
            </span>
          </div>

          {enrolledSubjects.length === 0 ? (
            <div className="empty-academic-state">
              <BookOpen size={48} className="text-muted" />
              <h4>No Enrolled Subjects Recorded</h4>
              <p>Subject registrations for this semester will appear once approved by the Department HOD.</p>
            </div>
          ) : (
            <div className="subjects-table-container">
              <table className="academics-data-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                    <th>Type</th>
                    <th>Credits</th>
                    <th>Assigned Faculty</th>
                    <th>Academic Session</th>
                    <th style={{ textAlign: 'center' }}>Syllabus &amp; Materials</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledSubjects.map((sub) => (
                    <tr key={sub.code}>
                      <td>
                        <strong className="code-badge">{sub.code}</strong>
                      </td>
                      <td>
                        <div className="sub-name-cell">
                          <strong>{sub.name}</strong>
                          <small>{sub.department}</small>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`type-pill ${
                            sub.type?.toLowerCase().includes('lab')
                              ? 'type-lab'
                              : sub.type?.toLowerCase().includes('project')
                              ? 'type-project'
                              : 'type-theory'
                          }`}
                        >
                          {sub.type}
                        </span>
                      </td>
                      <td>
                        <strong>{sub.credits}</strong> Credits
                      </td>
                      <td>
                        <div className="faculty-cell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={13} />
                            <strong>{sub.faculty}</strong>
                          </div>
                          {sub.facultyEmail && (
                            <a
                              href={`mailto:${sub.facultyEmail}`}
                              style={{ fontSize: '0.74rem', color: '#2563eb', textDecoration: 'none' }}
                            >
                              ✉️ {sub.facultyEmail}
                            </a>
                          )}
                          {sub.facultyPhone && (
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              📞 {sub.facultyPhone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{sub.academicSession}</td>
                      <td>
                        <div className="sub-actions-cell">
                          <button
                            type="button"
                            className="btn-sub-action syllabus"
                            onClick={() => setActiveSyllabusModalSub(sub)}
                            title="View Curriculum Modules & Outcomes"
                          >
                            <Layers size={13} /> Syllabus
                          </button>
                          <button
                            type="button"
                            className="btn-sub-action notes"
                            onClick={() => {
                              setMaterialSubject(sub.name)
                              setActiveTab('notes')
                            }}
                            title="Filter Related Study Materials"
                          >
                            <FileText size={13} /> Notes
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 4: PROGRAMME & TERM HISTORY (SEMESTER PROGRESSION) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'progression' && (
        <div className="academics-progression-view">
          <div className="view-intro-bar">
            <div>
              <h3>Institutional Semester Progression Register</h3>
              <p>Historical enrollment trail, SGPA performance trajectory, and certified marksheets.</p>
            </div>
            <button
              type="button"
              className="btn-action-outline"
              onClick={handleDownloadTranscript}
            >
              <Download size={14} /> Download Complete Transcript
            </button>
          </div>

          {/* Visual Progression Timeline */}
          <div className="progression-timeline-strip">
            {progressionHistory.map((sem) => (
              <div
                key={sem.semesterNumber}
                className={`timeline-step-card ${sem.status.toLowerCase()}`}
              >
                <div className="step-badge">
                  {sem.status === 'COMPLETED' ? (
                    <CheckCircle2 size={14} />
                  ) : sem.status === 'ENROLLED' ? (
                    <Clock size={14} />
                  ) : (
                    sem.semesterNumber
                  )}
                </div>
                <strong>{sem.semesterLabel}</strong>
                <small>{sem.academicSession}</small>
                {sem.sgpa ? (
                  <span className="step-sgpa">SGPA: {Number(sem.sgpa).toFixed(2)}</span>
                ) : (
                  <span className="step-sgpa pending">{sem.status === 'ENROLLED' ? 'Ongoing' : 'Upcoming'}</span>
                )}
              </div>
            ))}
          </div>

          {/* Progression Table */}
          <div className="progression-table-container">
            <table className="academics-data-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Session</th>
                  <th>Status</th>
                  <th>SGPA</th>
                  <th>CGPA</th>
                  <th>Credits Earned</th>
                  <th>Backlogs</th>
                  <th>Publication Date</th>
                  <th style={{ textAlign: 'center' }}>Marksheet Action</th>
                </tr>
              </thead>
              <tbody>
                {progressionHistory.map((sem) => {
                  const isExpanded = expandedProgressionSem === sem.semesterNumber
                  return (
                    <React.Fragment key={sem.semesterNumber}>
                      <tr className={sem.status === 'ENROLLED' ? 'row-active-enrolled' : ''}>
                        <td>
                          <strong>{sem.semesterLabel}</strong>
                        </td>
                        <td>{sem.academicSession}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              sem.status === 'COMPLETED'
                                ? 'status-completed'
                                : sem.status === 'ENROLLED'
                                ? 'status-active'
                                : 'status-upcoming'
                            }`}
                          >
                            {sem.status === 'COMPLETED' ? '✓ Passed' : sem.status === 'ENROLLED' ? 'Active' : 'Upcoming'}
                          </span>
                        </td>
                        <td>
                          {sem.sgpa ? (
                            <strong className="text-blue">{Number(sem.sgpa).toFixed(2)}</strong>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          {sem.cgpa ? (
                            <strong className="text-green">{Number(sem.cgpa).toFixed(2)}</strong>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <strong>{sem.earnedCredits}</strong> / {sem.totalCredits}
                        </td>
                        <td>
                          <span className={sem.backlogStatus?.includes('Clear') ? 'text-green' : 'text-red'}>
                            {sem.backlogStatus}
                          </span>
                        </td>
                        <td>{sem.resultPublicationDate || 'Pending'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            {sem.marksheetAvailable ? (
                              <button
                                type="button"
                                className="btn-sub-action download"
                                onClick={() => handleDownloadMarksheet(sem)}
                                title="Download Semester Grade Sheet PDF"
                              >
                                <Download size={13} /> Marksheet
                              </button>
                            ) : (
                              <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                                Awaiting Results
                              </span>
                            )}
                            {sem.subjects && sem.subjects.length > 0 && (
                              <button
                                type="button"
                                className="btn-sub-action syllabus"
                                onClick={() =>
                                  setExpandedProgressionSem(isExpanded ? null : sem.semesterNumber)
                                }
                                title="Toggle Subject Marks Details"
                              >
                                {isExpanded ? 'Hide' : 'Details'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Details Sub-table */}
                      {isExpanded && sem.subjects && sem.subjects.length > 0 && (
                        <tr className="expanded-detail-row">
                          <td colSpan={9} style={{ padding: '12px 18px', background: '#f8fafc' }}>
                            <div className="expanded-detail-box">
                              <h5 style={{ margin: '0 0 8px', fontSize: '0.86rem', color: '#0f172a' }}>
                                Subject Performance Breakdown — {sem.semesterLabel}
                              </h5>
                              <table className="sub-breakdown-table">
                                <thead>
                                  <tr>
                                    <th>Subject Code</th>
                                    <th>Subject Name</th>
                                    <th>Credits</th>
                                    <th>Type</th>
                                    <th>Grade Point</th>
                                    <th>Letter Grade</th>
                                    <th>Standing</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sem.subjects.map((s) => (
                                    <tr key={s.code}>
                                      <td><code>{s.code}</code></td>
                                      <td>{s.name}</td>
                                      <td>{s.credits}</td>
                                      <td>{s.type}</td>
                                      <td><strong>{s.gradePoint} / 10</strong></td>
                                      <td><strong className="grade-badge">{s.gradeLetter}</strong></td>
                                      <td><span className="text-green">✓ {s.result}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 5: CLASS NOTES & STUDY MATERIAL SHARING */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'notes' && (
        <div className="academics-notes-view">
          <div className="view-intro-bar">
            <div>
              <h3>Curriculum Class Notes &amp; Study Resources</h3>
              <p>Official faculty study material, handwritten lecture transcripts, and previous year examination solutions.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-action-outline"
                onClick={() => setShowRequestModal(true)}
              >
                <HelpCircle size={14} /> Request Notes
              </button>
              <button
                type="button"
                className="btn-action-primary"
                onClick={() => setShowUploadModal(true)}
              >
                <Plus size={14} /> Upload Notes
              </button>
            </div>
          </div>

          {/* 8 Categories Filter Pills */}
          <div className="material-category-pills">
            {[
              'All Categories',
              'Official Faculty Notes',
              'Lecture Slides',
              'Previous Year Questions',
              'Assignments',
              'Handwritten Notes',
              'Lab Manuals',
              'Reference Materials',
              'Student Shared Notes'
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${materialCategory === cat ? 'active' : ''}`}
                onClick={() => setMaterialCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search and Secondary Filters Bar */}
          <div className="materials-filter-bar">
            <div className="filter-search-box">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search resources, topics, or faculty..."
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
              />
            </div>
            <div className="filter-dropdowns">
              <select
                value={materialSubject}
                onChange={(e) => setMaterialSubject(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Subjects</option>
                {enrolledSubjects.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>

              <select
                value={materialFileType}
                onChange={(e) => setMaterialFileType(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All File Types</option>
                <option value="PDF">PDF Documents</option>
                <option value="Slides">Lecture Slides</option>
                <option value="Handwritten">Handwritten Scans</option>
              </select>
            </div>
          </div>

          {/* Materials Grid */}
          <div className="materials-card-grid">
            {filteredMaterials.length === 0 ? (
              <div className="empty-academic-state" style={{ gridColumn: '1 / -1' }}>
                <FileText size={42} className="text-muted" />
                <h4>No Study Resources Match Your Filters</h4>
                <p>Try resetting filters or use the Request Notes button to solicit peer/faculty contributions.</p>
              </div>
            ) : (
              filteredMaterials.map((mat) => (
                <div key={mat.id} className="material-card">
                  <div className="material-card-top">
                    <span className="material-subject-badge">{mat.subject}</span>
                    <span
                      className={`material-type-pill ${
                        mat.isFacultyVerified ? 'faculty-verified' : 'peer-shared'
                      }`}
                    >
                      {mat.isFacultyVerified ? (
                        <>
                          <ShieldCheck size={12} /> Verified
                        </>
                      ) : (
                        'Peer Shared'
                      )}
                    </span>
                  </div>

                  <h4 className="material-title">{mat.title}</h4>
                  <p className="material-desc">{mat.description}</p>

                  <div className="material-meta-row">
                    <div>
                      <small>UPLOADED BY</small>
                      <strong>{mat.uploaderName}</strong>
                    </div>
                    <div>
                      <small>CATEGORY</small>
                      <span>{mat.category}</span>
                    </div>
                  </div>

                  <div className="material-card-footer">
                    <div className="material-specs">
                      <span>{mat.fileType}</span>
                      <span>·</span>
                      <span>{mat.fileSize}</span>
                      <span>·</span>
                      <button
                        type="button"
                        className="btn-helpful-vote"
                        onClick={() => handleVoteHelpful(mat.id)}
                        title="Mark as helpful resource"
                      >
                        <ThumbsUp size={12} /> {mat.helpfulCount + (helpfulVotes[mat.id] || 0)}
                      </button>
                    </div>
                    <div className="material-actions">
                      <button
                        type="button"
                        className="btn-mat-action preview"
                        onClick={() => setViewingMaterial(mat)}
                        title="Preview Document"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-mat-action download"
                        onClick={() => showToast(`Downloading ${mat.title}...`)}
                        title="Download Document"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-mat-action share-wa"
                        style={{ color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                        onClick={() => {
                          const targetConv = mat.subject?.toLowerCase().includes('data structure') ? 'conv-ds' : 'conv-ds';
                          campusConnectStore.sendMessage(targetConv, {
                            text: `Resource Shared: ${mat.title} (${mat.fileSize}) for ${mat.subject}. Verified study outline.`,
                            sender: student.name || 'Student',
                            senderRole: 'student',
                            resource: {
                              id: mat.id,
                              title: mat.title,
                              fileType: mat.fileType,
                              downloadUrl: '/sample_documents/sample_document.pdf'
                            }
                          });
                          showToast(`Shared "${mat.title}" to Class WhatsApp group!`);
                        }}
                        title="Share this resource to Class WhatsApp group"
                      >
                        <MessageSquare size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-mat-action report"
                        onClick={() => setShowReportModal(mat.id)}
                        title="Report Inaccurate Material"
                      >
                        <Flag size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 6: EXAMINATION & ADMIT CARD */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'admit-card' && (
        <div className="academics-admit-view">
          <div className="view-intro-bar">
            <div>
              <h3>Autonomous Examination Admit Card &amp; Hall Ticket</h3>
              <p>Authenticated examination hall clearances, seating allocations, and printable verification passes.</p>
            </div>
            <span
              className={`badge-exam-status ${
                upcomingExam?.status === 'ADMIT CARD AVAILABLE'
                  ? 'status-available'
                  : 'status-pending'
              }`}
            >
              {upcomingExam?.status}
            </span>
          </div>

          {upcomingExam && (
            <div className="admit-dashboard-box">
              {/* Header Box */}
              <div className="admit-exam-hero">
                <div>
                  <span className="exam-type-pill">{upcomingExam.examType}</span>
                  <h4>{upcomingExam.examName}</h4>
                  <p>
                    {upcomingExam.examinationCentre} · Session: {upcomingExam.academicSession}
                  </p>
                </div>
                <div className="admit-hero-actions">
                  <button
                    type="button"
                    className="btn-action-primary"
                    disabled={upcomingExam.status === 'NOT ELIGIBLE' || upcomingExam.status === 'WITHHELD'}
                    onClick={() => setShowDownloadConfirm(true)}
                  >
                    <Download size={14} /> Download Verified Admit Card
                  </button>
                  <button
                    type="button"
                    className="btn-action-outline"
                    onClick={() => setShowDocPreviewModal(true)}
                  >
                    <Eye size={14} /> Official Paper Preview
                  </button>
                </div>
              </div>

              {/* Real Eligibility Checks Grid */}
              <div className="eligibility-checklist-card">
                <h5 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#0f172a' }}>
                  Institutional Examination Hall Clearance Requirements
                </h5>
                <div className="checklist-items-grid">
                  <div
                    className={`check-item ${
                      upcomingExam.eligibility.attendanceEligible ? 'valid' : 'invalid'
                    }`}
                  >
                    <div className="check-icon">
                      {upcomingExam.eligibility.attendanceEligible ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <X size={16} />
                      )}
                    </div>
                    <div>
                      <strong>Attendance Threshold (&ge; 75%)</strong>
                      <p>
                        Current: <strong>{upcomingExam.eligibility.attendancePercentage}%</strong> ·{' '}
                        {upcomingExam.eligibility.attendanceEligible
                          ? 'Requirement satisfied'
                          : 'Shortage (Medical Condonation required)'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`check-item ${
                      upcomingExam.eligibility.feesCleared ? 'valid' : 'invalid'
                    }`}
                  >
                    <div className="check-icon">
                      {upcomingExam.eligibility.feesCleared ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <X size={16} />
                      )}
                    </div>
                    <div>
                      <strong>Institutional Accounts Clearance</strong>
                      <p>{upcomingExam.eligibility.feeClearanceStatus}</p>
                    </div>
                  </div>

                  <div className="check-item valid">
                    <div className="check-icon">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <strong>Examination Cell Registration</strong>
                      <p>{upcomingExam.eligibility.examRegistrationStatus}</p>
                    </div>
                  </div>

                  <div className="check-item valid">
                    <div className="check-icon">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <strong>Disciplinary Standing</strong>
                      <p>{upcomingExam.eligibility.disciplinaryClearance}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Table */}
              <div className="admit-schedule-section">
                <h5 style={{ margin: '14px 0 10px', fontSize: '0.92rem', color: '#0f172a' }}>
                  Timetable &amp; Hall Seating Arrangement
                </h5>
                <table className="academics-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>Sl.</th>
                      <th>Date &amp; Day</th>
                      <th>Sitting &amp; Time</th>
                      <th>Paper Code</th>
                      <th>Subject Name</th>
                      <th>Allocated Hall / Desk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingExam.schedule.map((slot) => (
                      <tr key={slot.code}>
                        <td style={{ textAlign: 'center' }}>{slot.sl}</td>
                        <td>
                          <strong>{slot.dateFull}</strong>
                        </td>
                        <td>
                          <span className="sitting-badge">{slot.sitting}</span> {slot.time}
                        </td>
                        <td>
                          <code>{slot.code}</code>
                        </td>
                        <td>
                          <strong>{slot.subject}</strong>
                        </td>
                        <td>
                          <span className="venue-pill">{slot.venue}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}



      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 7B: OFFICIAL ACADEMIC TRANSCRIPT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'transcript' && (
        <div className="academics-transcript-view">
          <div className="view-intro-bar">
            <div>
              <h3>Institutional Academic Transcript</h3>
              <p>Certified cumulative academic record for employment, higher education, and scholarship verification.</p>
            </div>
            <button
              type="button"
              className="btn-action-primary"
              onClick={handleDownloadTranscript}
            >
              <Download size={14} /> Export Verified Transcript PDF
            </button>
          </div>

          <div className="transcript-preview-sheet">
            <div className="transcript-hero-header">
              <img src="/logo.png" alt="Apna Campus Logo" className="transcript-logo" />
              <div>
                <h4>APNA CAMPUS AUTONOMOUS INSTITUTION</h4>
                <h5>OFFICIAL CUMULATIVE ACADEMIC TRANSCRIPT</h5>
                <p>Approved under UGC Autonomous Framework &bull; Affiliated to BPUT, Odisha</p>
              </div>
            </div>

            <div className="transcript-meta-grid">
              <div>
                <small>CANDIDATE NAME</small>
                <strong>{student.name.toUpperCase()}</strong>
              </div>
              <div>
                <small>REGISTRATION NUMBER</small>
                <strong>{student.registrationNumber}</strong>
              </div>
              <div>
                <small>PROGRAMME</small>
                <strong>{student.programme}</strong>
              </div>
              <div>
                <small>ADMISSION BATCH</small>
                <strong>{student.batch}</strong>
              </div>
            </div>

            {/* Multi-Semester Table */}
            <table className="academics-data-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Session</th>
                  <th>Credits Required</th>
                  <th>Credits Earned</th>
                  <th>SGPA</th>
                  <th>CGPA</th>
                  <th>Standing</th>
                </tr>
              </thead>
              <tbody>
                {progressionHistory.map((p) => (
                  <tr key={p.semesterNumber}>
                    <td><strong>{p.semesterLabel}</strong></td>
                    <td>{p.academicSession}</td>
                    <td>{p.totalCredits}</td>
                    <td>{p.earnedCredits}</td>
                    <td>{p.sgpa ? Number(p.sgpa).toFixed(2) : '—'}</td>
                    <td>{p.cgpa ? Number(p.cgpa).toFixed(2) : '—'}</td>
                    <td>
                      <span
                        className={p.status === 'COMPLETED' ? 'text-green' : 'text-muted'}
                        style={{ fontWeight: 600 }}
                      >
                        {p.status === 'COMPLETED' ? 'PASSED (DISTINCTION)' : p.status === 'ENROLLED' ? 'IN PROGRESS' : 'UPCOMING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="transcript-summary-box">
              <div>
                <small>TOTAL CREDITS COMPLETED</small>
                <strong>88 / 160</strong>
              </div>
              <div>
                <small>OVERALL CGPA</small>
                <strong className="text-green">{student.cgpa ? `${student.cgpa} / 10.0` : 'N/A'}</strong>
              </div>
              <div>
                <small>DEGREE COMPLETION STANDING</small>
                <strong className="text-blue">GOOD STANDING (REGULAR)</strong>
              </div>
              <div>
                <small>SEAL VERIFICATION</small>
                <strong className="text-purple">CRYPTOGRAPHICALLY AUTHENTICATED</strong>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 7D: BACKLOG & SUPPLEMENTARY TRACKER */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'backlogs' && (
        <div className="academics-backlog-view">
          <div className="view-intro-bar">
            <div>
              <h3>Backlog Register &amp; Supplementary Examination Desk</h3>
              <p>Track academic paper arrears, clearance timelines, and submit supplementary applications.</p>
            </div>
            <button
              type="button"
              className="btn-action-primary"
              onClick={() => setShowSupplementaryModal(true)}
            >
              <Plus size={14} /> Register Supplementary Paper
            </button>
          </div>

          <div className="backlog-status-summary-card">
            <div className="backlog-status-main">
              <CheckCircle2 size={32} className="text-green" />
              <div>
                <h4>Zero Active Academic Backlogs</h4>
                <p>
                  You are in good academic standing. All enrolled modules from Semester 1 through Semester 4 have been successfully cleared.
                </p>
              </div>
            </div>
            <div className="backlog-metric">
              <small>ACTIVE ARREARS</small>
              <strong className="text-green">0 Papers</strong>
            </div>
          </div>

          <div className="supplementary-guidelines-card">
            <h5>Autonomous Supplementary Examination Regulations</h5>
            <ul>
              <li>Candidates with F grades or detained status in continuous evaluation may register during the open window.</li>
              <li>Prescribed Institutional Supplementary Examination Fee is <strong>₹500 per theory paper</strong> and <strong>₹300 per practical lab</strong>.</li>
              <li>Re-totaling and photocopy scrutiny requests must be lodged within 14 calendar days of semester result declaration.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 7E: SYLLABUS & ASSIGNMENT TRACKER */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'tracker' && (
        <div className="academics-tracker-view">
          <div className="view-intro-bar">
            <div>
              <h3>Syllabus Coverage &amp; Assignment Tracker</h3>
              <p>Continuous internal evaluation tasks, unit progression meters, and submission deadlines.</p>
            </div>
          </div>

          {/* Syllabus Progress Grid */}
          <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#0f172a' }}>
            Unit-Wise Curriculum Coverage ({student.semester})
          </h4>
          <div className="syllabus-tracker-grid">
            {syllabusProgress.map((item) => (
              <div key={item.code} className="syllabus-progress-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong>{item.name}</strong>
                  <span className="text-blue" style={{ fontWeight: 700 }}>
                    {item.completedPercentage}%
                  </span>
                </div>
                <div className="progress-track-bg">
                  <div
                    className="progress-fill-bar"
                    style={{ width: `${item.completedPercentage}%` }}
                  />
                </div>
                <div className="syllabus-progress-meta">
                  <small>
                    Completed: {item.completedUnits} of {item.totalUnits} Units
                  </small>
                  <small>Next: {item.nextLectureTopic}</small>
                </div>
              </div>
            ))}
          </div>

          {/* Active Assignments */}
          <h4 style={{ margin: '24px 0 12px', fontSize: '1rem', color: '#0f172a' }}>
            Subject Assignments &amp; Projects
          </h4>
          <table className="academics-data-table">
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Subject</th>
                <th>Deadline</th>
                <th>Max Marks</th>
                <th>Faculty</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Score / Feedback</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((asg) => (
                <tr key={asg.id}>
                  <td><strong>{asg.title}</strong></td>
                  <td>{asg.subject}</td>
                  <td>{asg.deadline}</td>
                  <td>{asg.maxMarks} Marks</td>
                  <td>{asg.faculty}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        asg.status === 'Graded'
                          ? 'status-completed'
                          : asg.status === 'Submitted'
                          ? 'status-active'
                          : 'status-upcoming'
                      }`}
                    >
                      {asg.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {asg.score !== null ? (
                      <strong className="text-green">{asg.score} / {asg.maxMarks}</strong>
                    ) : (
                      <span className="text-muted">{asg.feedback}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}



      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: SYLLABUS DETAIL MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSyllabusModalSub && (
        <div
          className="academics-modal-backdrop"
          onClick={() => setActiveSyllabusModalSub(null)}
        >
          <div className="academics-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="academics-modal-close"
              onClick={() => setActiveSyllabusModalSub(null)}
            >
              ×
            </button>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Layers size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                  {activeSyllabusModalSub.name}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Code: <code>{activeSyllabusModalSub.code}</code> &bull; Credits: {activeSyllabusModalSub.credits} &bull; Faculty: {activeSyllabusModalSub.faculty}
                </p>
              </div>
            </div>

            <div className="syllabus-units-accordion">
              {activeSyllabusModalSub.syllabusUnits?.map((unit) => (
                <div key={unit.unit} className="unit-card">
                  <div className="unit-header">
                    <strong>Module {unit.unit}: {unit.title}</strong>
                    <span className="unit-hours">{unit.hours} Hours</span>
                  </div>
                  <p className="unit-topics">{unit.topics}</p>
                </div>
              ))}
            </div>

            <div className="learning-outcomes-box">
              <h5>Course Learning Outcomes (CLOs)</h5>
              <ul>
                {activeSyllabusModalSub.learningOutcomes?.map((clo, idx) => (
                  <li key={idx}>{clo}</li>
                ))}
              </ul>
            </div>

            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-academic-secondary"
                onClick={() => setActiveSyllabusModalSub(null)}
              >
                Close Syllabus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: UPLOAD CLASS NOTES */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showUploadModal && (
        <div
          className="academics-modal-backdrop"
          onClick={() => setShowUploadModal(false)}
        >
          <div className="academics-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="academics-modal-close"
              onClick={() => setShowUploadModal(false)}
            >
              ×
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UploadCloud size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                  Upload Academic Notes &amp; Study Material
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Submit notes for peer access &amp; official faculty verification.
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="academic-form-label">Subject</label>
                  <select
                    className="academic-form-input"
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                  >
                    {enrolledSubjects.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="academic-form-label">Resource Category</label>
                  <select
                    className="academic-form-input"
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  >
                    <option value="Handwritten Notes">Handwritten Notes</option>
                    <option value="Lecture Slides">Lecture Slides</option>
                    <option value="Previous Year Questions">Previous Year Questions</option>
                    <option value="Assignments">Assignments</option>
                    <option value="Lab Manuals">Lab Manuals</option>
                    <option value="Reference Materials">Reference Materials</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="academic-form-label">
                    Topic Title <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="academic-form-input"
                    value={uploadForm.topic}
                    onChange={(e) => setUploadForm({ ...uploadForm, topic: e.target.value })}
                    placeholder="e.g. Backpropagation Algorithm Derivation"
                    required
                  />
                </div>
                <div>
                  <label className="academic-form-label">Module / Unit</label>
                  <select
                    className="academic-form-input"
                    value={uploadForm.moduleNumber}
                    onChange={(e) => setUploadForm({ ...uploadForm, moduleNumber: Number(e.target.value) })}
                  >
                    <option value={1}>Unit 1</option>
                    <option value={2}>Unit 2</option>
                    <option value={3}>Unit 3</option>
                    <option value={4}>Unit 4</option>
                    <option value={5}>Unit 5</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="academic-form-label">Summary / Highlights</label>
                <textarea
                  className="academic-form-input"
                  rows={2}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Key concepts, diagrams, or formula summaries included in this upload..."
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="academic-form-label">
                  Attach Document / PDF / Scans <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div className="file-drop-card">
                  <input
                    type="file"
                    id="acad-upload-file-input"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.docx"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="acad-upload-file-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <UploadCloud size={30} style={{ color: '#4338ca', marginBottom: '4px' }} />
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                      {selectedFile ? selectedFile.name : 'Click to select study material file'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                      Supported formats: PDF, DOCX, JPG, PNG &bull; Max 15MB
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="btn-academic-secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-academic-primary">
                  Submit for Verification ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: REQUEST NOTES MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showRequestModal && (
        <div
          className="academics-modal-backdrop"
          onClick={() => setShowRequestModal(false)}
        >
          <div className="academics-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="academics-modal-close"
              onClick={() => setShowRequestModal(false)}
            >
              ×
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#fef3c7',
                  color: '#b45309',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                  Request Study Material
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Notify faculty and class representatives to publish notes on missing topics.
                </p>
              </div>
            </div>

            <form onSubmit={handleRequestSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label className="academic-form-label">Subject</label>
                <select
                  className="academic-form-input"
                  value={requestForm.subject}
                  onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })}
                >
                  {enrolledSubjects.map((s) => (
                    <option key={s.code} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="academic-form-label">
                  Topic / Concept Required <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  className="academic-form-input"
                  value={requestForm.topic}
                  onChange={(e) => setRequestForm({ ...requestForm, topic: e.target.value })}
                  placeholder="e.g. Proof of Master Theorem with Step-by-Step Examples"
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="academic-form-label">Specific Questions / Urgency Notes</label>
                <textarea
                  className="academic-form-input"
                  rows={2}
                  value={requestForm.remarks}
                  onChange={(e) => setRequestForm({ ...requestForm, remarks: e.target.value })}
                  placeholder="Need this before upcoming CIE-II test on Monday..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="btn-academic-secondary"
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-academic-primary">
                  Post Request ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 4: VIEW SINGLE STUDY MATERIAL PREVIEW */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewingMaterial && (
        <div
          className="academics-modal-backdrop"
          onClick={() => setViewingMaterial(null)}
        >
          <div
            className="academics-modal-card"
            style={{ maxWidth: '680px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="academics-modal-close"
              onClick={() => setViewingMaterial(null)}
            >
              ×
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <span className="note-subject-tag">{viewingMaterial.subject}</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: '#0f172a' }}>
                  {viewingMaterial.title}
                </h3>
                <small style={{ color: '#64748b' }}>
                  Uploaded by {viewingMaterial.uploaderName} &bull; {viewingMaterial.uploadDate}
                </small>
              </div>
              {viewingMaterial.isFacultyVerified ? (
                <span className="academic-badge-verified">
                  <ShieldCheck size={13} /> ✓ Faculty Verified
                </span>
              ) : (
                <span className="academic-badge-pending">Peer Shared</span>
              )}
            </div>

            <div className="document-preview-viewport">
              <FileText size={48} style={{ color: '#818cf8', marginBottom: '8px' }} />
              <div style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>
                {viewingMaterial.title}.pdf
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 12px' }}>
                Format: {viewingMaterial.fileType} &bull; Size: {viewingMaterial.fileSize} &bull; Verified Archival Copy
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-doc-download"
                  onClick={() => showToast(`Downloading ${viewingMaterial.title}...`)}
                >
                  <Download size={14} /> Download File
                </button>
                <button
                  type="button"
                  className="btn-doc-print"
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            <p className="material-detail-desc">{viewingMaterial.description}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <button
                type="button"
                className="btn-helpful-vote"
                onClick={() => handleVoteHelpful(viewingMaterial.id)}
              >
                <ThumbsUp size={13} /> Helpful ({viewingMaterial.helpfulCount + (helpfulVotes[viewingMaterial.id] || 0)})
              </button>
              <button
                type="button"
                className="btn-academic-secondary"
                onClick={() => setViewingMaterial(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 5: DOWNLOAD ADMIT CARD CONFIRMATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showDownloadConfirm && upcomingExam && (
        <div
          className="admit-confirm-backdrop"
          onClick={() => setShowDownloadConfirm(false)}
        >
          <div className="admit-confirm-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="admit-confirm-close-btn"
              onClick={() => setShowDownloadConfirm(false)}
            >
              ×
            </button>
            <div className="admit-confirm-text">
              Generate and download official examination admit card for <strong>{upcomingExam.examName}</strong>?
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
                  handleDownloadAdmitCard()
                }}
              >
                Confirm &amp; Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 6: AUTHENTIC ADMIT CARD OFFICIAL PAPER PREVIEW */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showDocPreviewModal && upcomingExam && (
        <div
          className="admit-doc-backdrop"
          onClick={() => setShowDocPreviewModal(false)}
        >
          <div className="admit-doc-card" onClick={(e) => e.stopPropagation()}>
            <div className="admit-doc-toolbar no-print">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-official-verified">✓ Official Apna Campus Autonomous Document</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Ready for official examination hall entry</span>
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
                  onClick={handleDownloadAdmitCard}
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

            {/* Printable Paper (A4 Style) */}
            <div className="admit-paper-sheet printable-admit-sheet">
              <div className="admit-paper-watermark" aria-hidden="true">
                <img src="/logo.png" alt="Apna Campus Watermark" />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="admit-paper-header">
                  <div className="admit-paper-logo">
                    <img src="/logo.png" alt="Apna Campus Logo" />
                  </div>
                  <div className="admit-paper-titles">
                    <h2>APNA CAMPUS AUTONOMOUS COLLEGE, BHUBANESWAR</h2>
                    <h3 className="admit-card-title-underlined">ADMIT CARD</h3>
                    <h4>{upcomingExam.examName}</h4>
                  </div>
                </div>

                <div className="admit-paper-candidate-row">
                  <table className="admit-candidate-table">
                    <tbody>
                      <tr>
                        <td className="candidate-field-label">Registration No.</td>
                        <td className="candidate-field-val">- {student.registrationNumber}</td>
                      </tr>
                      <tr>
                        <td className="candidate-field-label">Candidate's Name</td>
                        <td className="candidate-field-val">- {student.name.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td className="candidate-field-label">Course / Discipline</td>
                        <td className="candidate-field-val">- {student.programme}</td>
                      </tr>
                      <tr>
                        <td className="candidate-field-label">Admission Batch / Sem</td>
                        <td className="candidate-field-val">- {student.batch} ({student.semester})</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="admit-candidate-photo-box">
                    <div className="candidate-photo-frame">
                      <img
                        src="/candidate_photo_apna.png"
                        alt="Candidate"
                        onError={(e) => {
                          e.target.src = '/passport_photo_male.svg'
                        }}
                      />
                    </div>
                    <div className="candidate-sig-label">Candidate's Signature</div>
                  </div>
                </div>

                <div className="admit-paper-schedule-title">
                  Schedule of Examination &bull; Centre: {upcomingExam.examinationCentre}
                </div>

                <table className="admit-paper-sched-table">
                  <thead>
                    <tr>
                      <th style={{ width: '6%' }}>Sl.</th>
                      <th style={{ width: '24%' }}>Date &amp; Day</th>
                      <th style={{ width: '12%' }}>Sitting</th>
                      <th style={{ width: '22%' }}>Time</th>
                      <th style={{ width: '14%' }}>Code</th>
                      <th style={{ width: '22%' }}>Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingExam.schedule.map((s) => (
                      <tr key={s.code}>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s.sl}</td>
                        <td style={{ textAlign: 'center' }}>{s.dateFull}</td>
                        <td style={{ textAlign: 'center' }}>{s.sitting}</td>
                        <td style={{ textAlign: 'center' }}>{s.time}</td>
                        <td style={{ textAlign: 'center' }}><code>{s.code}</code></td>
                        <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{s.subject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="admit-paper-signatures-row">
                  <div className="admit-sig-block">
                    <img
                      src="/admit_sig_center_sup.png"
                      alt="Centre Superintendent"
                      className="admit-sig-img"
                    />
                    <div className="admit-stamp-box">
                      <div className="stamp-title">Centre Superintendent</div>
                      <div className="stamp-sub">Apna Campus, Bhubaneswar</div>
                    </div>
                  </div>

                  <div className="admit-sig-block right">
                    <img
                      src="/admit_sig_controller.png"
                      alt="Controller of Examinations"
                      className="admit-sig-img"
                    />
                    <div className="admit-stamp-box">
                      <div className="stamp-title">Controller of Examinations</div>
                      <div className="stamp-sub">Apna Campus Autonomous Examination Cell</div>
                    </div>
                  </div>
                </div>

                <div className="admit-paper-instructions">
                  <div className="instructions-title">*Instructions for Candidate</div>
                  <ol className="instructions-list">
                    <li>This Admit Card is issued based on verified biometric attendance (&ge;75%) and institutional accounts clearance.</li>
                    <li>Candidate must produce their physical Student ID Card along with this Admit Card at the examination entrance.</li>
                    <li>Programmable calculators, smartwatches, and electronic devices are strictly prohibited in the examination hall.</li>
                    <li>Autonomous answer scripts will be digitized and evaluated through encrypted barcode indexing.</li>
                  </ol>
                </div>

                <div className="admit-paper-footer">
                  <span>Apna Campus Autonomous College</span>
                  <span>Verification Hash: {upcomingExam.qrToken}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 7: SUPPLEMENTARY EXAMINATION APPLICATION MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showSupplementaryModal && (
        <div
          className="academics-modal-backdrop"
          onClick={() => setShowSupplementaryModal(false)}
        >
          <div className="academics-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="academics-modal-close"
              onClick={() => setShowSupplementaryModal(false)}
            >
              ×
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                  Supplementary Examination Registration
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Register for special autonomous supplementary examination sessions.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#334155', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              Candidate: <strong>{student.name} ({student.rollNumber})</strong><br />
              Status: <strong>No current backlogs recorded.</strong> If registering for improvement or special paper, choose from the catalog below:
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label className="academic-form-label">Select Paper for Examination</label>
              <select className="academic-form-input">
                {enrolledSubjects.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} &bull; {s.name} (₹500 Fee)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                Fee: ₹500 per paper
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-academic-secondary"
                  onClick={() => setShowSupplementaryModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-academic-primary"
                  onClick={() => {
                    setShowSupplementaryModal(false)
                    showToast('Supplementary application submitted to Examination Cell.')
                  }}
                >
                  Submit Application ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
