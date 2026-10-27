import { useState, useEffect } from 'react'
import {
  Award,
  Bell,
  Briefcase,
  Building,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  User,
  AlertCircle,
  RotateCcw,
  Printer,
  X,
  Building2,
} from 'lucide-react'
import InternshipStudentProfile from '../components/InternshipStudentProfile.jsx'
import ErrorBoundary from '../components/Common/ErrorBoundary.jsx'
import './InternshipPage.css'
import placementStore from '../services/placementStore.js'

const internships = [
  {
    id: 'INT001',
    company: 'TechSurge India',
    role: 'Machine Learning Intern',
    location: 'Bhubaneswar (On-site)',
    duration: '2 Months',
    stipend: '₹8,000/month',
    deadline: '20 Oct 2026',
    skills: ['Python', 'TensorFlow', 'Data Analysis'],
    logo: 'TS',
    color: '#4a90e2',
    status: 'open',
  },
  {
    id: 'INT002',
    company: 'CloudNest Solutions',
    role: 'Cloud & DevOps Intern',
    location: 'Remote',
    duration: '3 Months',
    stipend: '₹12,000/month',
    deadline: '25 Oct 2026',
    skills: ['AWS', 'Docker', 'CI/CD'],
    logo: 'CN',
    color: '#27ae60',
    status: 'open',
  },
  {
    id: 'INT003',
    company: 'DataSense Analytics',
    role: 'Data Science Intern',
    location: 'Hyderabad (Hybrid)',
    duration: '6 Months',
    stipend: '₹15,000/month',
    deadline: '30 Oct 2026',
    skills: ['Python', 'SQL', 'Tableau', 'ML'],
    logo: 'DS',
    color: '#8e44ad',
    status: 'open',
  },
  {
    id: 'INT004',
    company: 'InnoSoft Technologies',
    role: 'Web Development Intern',
    location: 'Remote',
    duration: '2 Months',
    stipend: '₹6,000/month',
    deadline: '10 Oct 2026',
    skills: ['React', 'Node.js', 'MongoDB'],
    logo: 'IS',
    color: '#e67e22',
    status: 'closed',
  },
]

const initialApplications = [
  {
    id: 'APP001',
    company: 'TechSurge India',
    role: 'Machine Learning Intern',
    appliedOn: '02 Oct 2026',
    status: 'under_review',
    nextStep: 'Technical Round scheduled on 15 Oct 2026',
  },
  {
    id: 'APP002',
    company: 'CloudNest Solutions',
    role: 'Cloud & DevOps Intern',
    appliedOn: '28 Sep 2026',
    status: 'selected',
    nextStep: 'Offer Letter issued. Ready for enrollment.',
  },
]

// ── Starburst & List Icons matching ERP Screenshots ──
const StarburstIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path d="M12 2l1.7 4.3 4.4-1.6-1.6 4.4 4.3 1.7-4.3 1.7 1.6 4.4-4.4-1.6-1.7 4.3-1.7-4.3-4.4 1.6 1.6-4.4-4.3-1.7 4.3-1.7-1.6-4.4 4.4 1.6L12 2z" />
  </svg>
)

const ListIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <rect x="3" y="4" width="4.5" height="3.5" rx="0.5" />
    <rect x="9.5" y="4" width="11.5" height="3.5" rx="0.5" />
    <rect x="3" y="10.25" width="4.5" height="3.5" rx="0.5" />
    <rect x="9.5" y="10.25" width="11.5" height="3.5" rx="0.5" />
    <rect x="3" y="16.5" width="4.5" height="3.5" rx="0.5" />
    <rect x="9.5" y="16.5" width="11.5" height="3.5" rx="0.5" />
  </svg>
)

// ── The Internship Sub-Sections matching User Requirements ──
const INTERNSHIP_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', prefix: '»' },
  { id: 'opportunities', label: 'Internship Drives', prefix: '»' },
  { id: 'enrollment', label: 'Enrollment', prefix: '»' },
  { id: 'feedback', label: 'Feedback', prefix: '»' },
  { id: 'certificate', label: 'Certificate', prefix: '»' },
  { id: 'quiz', label: 'Quiz', prefix: '»' },
]

export default function InternshipPage({ account }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState({ APP001: true, APP002: true })
  const [toastMsg, setToastMsg] = useState('')
  const [selectedInternDetail, setSelectedInternDetail] = useState(null)
  const [internshipsList, setInternshipsList] = useState(() => {
    try {
      const published = placementStore?.getPublishedInternships ? placementStore.getPublishedInternships() : []
      return Array.isArray(published) && published.length > 0 ? published : internships
    } catch {
      return internships
    }
  })

  // Synchronize live with Placement Cell published internships
  useEffect(() => {
    const syncInternships = () => {
      try {
        const published = placementStore?.getPublishedInternships ? placementStore.getPublishedInternships() : []
        if (Array.isArray(published) && published.length > 0) {
          setInternshipsList(published)
        }
      } catch (err) {
        console.warn('Sync internships notice:', err)
      }
    }
    const unsub = (placementStore?.subscribe && typeof placementStore.subscribe === 'function')
      ? placementStore.subscribe(syncInternships)
      : () => {}
    window.addEventListener('cms_placement_updated', syncInternships)
    return () => {
      if (typeof unsub === 'function') unsub()
      window.removeEventListener('cms_placement_updated', syncInternships)
    }
  }, [])

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 5000)
  }

  // ── Student Identity ──
  const studentDisplayName = account?.name ? account.name.toUpperCase() : 'BISHNU PRASAD SAHOO'
  const studentParentName = account?.parentName ? account.parentName.toUpperCase() : 'MR. KAILASH CHANDRA SAHOO'
  const studentUploadedBy = account?.name ? `${account.name.toUpperCase()} (S)` : 'BISHNU PRASAD SAHOO (S)'
  const studentRoll = account?.roll || '2401432265'
  const studentBranch = 'Computer Science & Engineering (Sem 5)'

  // ── Modal & Preview States ──
  const [showCertUploadModal, setShowCertUploadModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedCertPreview, setSelectedCertPreview] = useState(null)

  // ─────────────────────────────────────────────────────────────
  // 2. CERTIFICATE STATE (MATCHING IMAGE 2)
  // ─────────────────────────────────────────────────────────────
  const [certificateRecords, setCertificateRecords] = useState([
    {
      id: 1,
      uploadedBy: studentUploadedBy,
      status: 'Approved',
      company: 'Central Tool Room and Training Center',
      course: 'CAD/CAM & CNC Machining',
      issueDate: '15-09-2026',
      hours: '240',
      grade: 'Grade O (Outstanding)',
      credentialId: 'CTTC-BBS-2026-9812',
    },
    {
      id: 2,
      uploadedBy: studentUploadedBy,
      status: 'Approved',
      company: 'Central Tool Room and Training Center',
      course: 'Industrial Automation & PLC',
      issueDate: '01-10-2026',
      hours: '180',
      grade: 'Grade A+ (Excellent)',
      credentialId: 'CTTC-BBS-2026-9813',
    },
  ])
  const [certFilters, setCertFilters] = useState({
    uploadedBy: '',
    status: '',
  })
  const [certUploadForm, setCertUploadForm] = useState({
    uploadedBy: studentUploadedBy,
    company: 'Central Tool Room and Training Center',
    customCompany: '',
    course: 'Python',
    fileName: 'internship_completion_certificate.pdf',
    issueDate: '2026-10-18',
    hours: '160',
    grade: 'Grade O (Outstanding)',
  })

  const filteredCertificates = certificateRecords.filter((item) => {
    if (certFilters.uploadedBy && !item.uploadedBy?.toLowerCase().includes(certFilters.uploadedBy.toLowerCase())) return false
    if (certFilters.status && !item.status?.toLowerCase().includes(certFilters.status.toLowerCase())) return false
    return true
  })

  const handleUploadCertSubmit = (e) => {
    e.preventDefault()
    const targetComp = certUploadForm.customCompany || certUploadForm.company || 'Central Tool Room and Training Center'
    const newCert = {
      id: certificateRecords.length + 1,
      uploadedBy: studentUploadedBy,
      status: 'Approved',
      company: targetComp,
      course: certUploadForm.course || 'Python',
      issueDate: certUploadForm.issueDate || '18-10-2026',
      hours: `${certUploadForm.hours} Hours`,
      grade: certUploadForm.grade,
      credentialId: `APNA-INT-CELL-${Math.floor(10000 + Math.random() * 90000)}`,
    }
    setCertificateRecords((prev) => [...prev, newCert])
    setShowCertUploadModal(false)
    showToast(`Certificate uploaded for ${targetComp}! Approved by Internship Cell.`)
  }

  // ─────────────────────────────────────────────────────────────
  // 3. ENROLLMENT STATE (MATCHING IMAGE 3)
  // ─────────────────────────────────────────────────────────────
  const APPROVED_COMPANIES = [
    'Central Tool Room and Training Center',
    'Glucian India Pvt. Ltd.',
    'TechSurge India Pvt. Ltd.',
    'CloudNest Solutions',
    'Tata Consultancy Services (TCS)',
    'Infosys Limited',
    'Wipro Technologies',
    'National Aluminium Company Limited (NALCO)',
    'Steel Authority of India Limited (SAIL)',
    'DRDO - Proof and Experimental Establishment (PXE)',
    'Hindustan Aeronautics Limited (HAL)',
    'Mahanadi Coalfields Limited (MCL)',
    'CSIR - IMMT Bhubaneswar',
    'Odisha Power Transmission Corporation Limited (OPTCL)',
    'Other (Manually Write Company Details)',
  ]

  const COURSE_OPTIONS = [
    'N/A',
    'Python',
    'Machine Learning & Artificial Intelligence',
    'Full Stack Web Development',
    'CAD/CAM & CNC Machining',
    'Industrial Automation & PLC',
    'Cloud Computing (AWS / Azure)',
    'Cybersecurity & Network Defense',
    'Data Science & Analytics',
    'Embedded Systems & IoT',
    'VLSI & Semiconductor Design',
    'Other / Custom',
  ]

  const [enrollmentRecords, setEnrollmentRecords] = useState([
    {
      id: 1,
      company: 'Central Tool Room and Training Center',
      course: 'N/A',
      preference: 'Second',
      description: '--',
      status: 'Approved',
    },
    {
      id: 2,
      company: 'Central Tool Room and Training Center',
      course: 'N/A',
      preference: 'First',
      description: '--',
      status: 'Pending',
    },
    {
      id: 3,
      company: 'Glucian India Pvt. Ltd.',
      course: 'Python',
      preference: 'First',
      description: '--',
      status: 'Approved',
    },
  ])

  const [enrollFilters, setEnrollFilters] = useState({
    company: '',
    course: '',
    preference: '',
    description: '',
    status: '',
  })

  const [enrollForm, setEnrollForm] = useState({
    companyMode: 'select', // 'select' | 'manual'
    selectedCompany: 'Central Tool Room and Training Center',
    manualCompany: '',
    companyAddress: '',
    supervisorEmail: '',
    course: 'Python',
    customCourse: '',
    preference: 'First',
    description: '--',
    offerLetter: 'internship_permission_request.pdf',
  })

  const filteredEnrollmentRecords = enrollmentRecords.filter((item) => {
    if (enrollFilters.company && !item.company?.toLowerCase().includes(enrollFilters.company.toLowerCase())) return false
    if (enrollFilters.course && !item.course?.toLowerCase().includes(enrollFilters.course.toLowerCase())) return false
    if (enrollFilters.preference && !item.preference?.toLowerCase().includes(enrollFilters.preference.toLowerCase())) return false
    if (enrollFilters.description && !item.description?.toLowerCase().includes(enrollFilters.description.toLowerCase())) return false
    if (enrollFilters.status && !item.status?.toLowerCase().includes(enrollFilters.status.toLowerCase())) return false
    return true
  })

  const handleEnrollSubmit = (e) => {
    e.preventDefault()
    let finalCompany = ''
    if (enrollForm.companyMode === 'manual' || enrollForm.selectedCompany === 'Other (Manually Write Company Details)') {
      if (!enrollForm.manualCompany.trim()) {
        showToast('Please type the Company Name.')
        return
      }
      finalCompany = enrollForm.manualCompany.trim()
    } else {
      finalCompany = enrollForm.selectedCompany
    }

    const finalCourse = enrollForm.course === 'Other / Custom' ? (enrollForm.customCourse || 'N/A') : (enrollForm.course || 'N/A')

    const newEnr = {
      id: enrollmentRecords.length + 1,
      company: finalCompany,
      course: finalCourse,
      preference: enrollForm.preference || 'First',
      description: enrollForm.description || '--',
      status: 'Pending', // Under Internship Cell approval
    }

    setEnrollmentRecords((prev) => [...prev, newEnr])
    setShowEnrollModal(false)
    showToast(`Enrollment submitted for "${finalCompany}"! Sent to Internship Cell for approval.`)
  }

  // ── Feedback State ──
  const [feedbackRatings, setFeedbackRatings] = useState({
    technical: 5,
    mentorship: 4,
    culture: 5,
    stipend: 4,
    overall: 5,
  })
  const [feedbackComments, setFeedbackComments] = useState({
    learnings: 'Built production neural models using PyTorch, deployed REST inference microservices with Docker, and learned daily agile sprint standups.',
    suggestions: 'Great working culture. Highly recommended for 3rd and 4th year CSE students passionate about Applied Deep Learning and NLP.',
  })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(true)

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()
    setFeedbackSubmitted(true)
    showToast('Your internship appraisal feedback has been submitted to T&P Cell. Thank you!')
  }

  // ── Certificate State ──
  const [certificates, setCertificates] = useState([
    {
      id: 'CERT-TS-9821',
      company: 'TechSurge India',
      role: 'Machine Learning Intern',
      issueDate: '02 Oct 2026',
      grade: 'O (Outstanding · 96%)',
      totalHours: '240 Hours',
      verificationStatus: 'T&P Verified ✓',
      credentialId: 'TS-IND-ML-2026-8819',
    },
  ])
  const [newCertForm, setNewCertForm] = useState({
    company: '',
    role: '',
    issueDate: '',
    grade: 'A+ (Excellent)',
    hours: '160',
    fileName: 'certificate_signed.pdf',
  })

  const handleCertSubmit = (e) => {
    e.preventDefault()
    if (!newCertForm.company || !newCertForm.role) {
      showToast('Please fill Company and Role for certificate submission.')
      return
    }
    const newC = {
      id: `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
      company: newCertForm.company,
      role: newCertForm.role,
      issueDate: newCertForm.issueDate || '18 Oct 2026',
      grade: newCertForm.grade,
      totalHours: `${newCertForm.hours} Hours`,
      verificationStatus: 'Under Verification',
      credentialId: `APNA-VERIF-${Math.floor(10000 + Math.random() * 90000)}`,
    }
    setCertificates((prev) => [newC, ...prev])
    showToast(`Certificate uploaded for ${newCertForm.company}! Sent to T&P Head for verification.`)
  }

  // ── Quiz State ──
  const [quizzes, setQuizzes] = useState([
    {
      id: 'quiz-1',
      title: 'Corporate Workplace Etiquette & IT Code of Conduct',
      duration: '15 Mins · 5 Questions',
      score: 100,
      passed: true,
      badge: 'Gold Certified',
    },
    {
      id: 'quiz-2',
      title: 'Git Version Control & Production Engineering Workflows',
      duration: '20 Mins · 5 Questions',
      score: 80,
      passed: true,
      badge: 'Silver Certified',
    },
    {
      id: 'quiz-3',
      title: 'Python, System Design & Problem Solving for Enterprise',
      duration: '25 Mins · 5 Questions',
      score: null,
      passed: false,
      badge: 'Pending',
    },
  ])
  const [activeQuizModal, setActiveQuizModal] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({ q1: 'b', q2: 'c', q3: 'a' })

  // ── Online Examination State ──
  const [examLaunched, setExamLaunched] = useState(false)

  const filteredInternships = internshipsList.filter((i) => {
    const q = search.toLowerCase()
    return !q || (i.company || '').toLowerCase().includes(q) || (i.role || i.title || '').toLowerCase().includes(q) || (i.requiredSkills || i.skills || []).some((s) => s.toLowerCase().includes(q))
  })

  function applyFor(intern) {
    const internRole = intern.role || intern.title || 'Intern'
    setApplied((prev) => ({ ...prev, [intern.id]: true }))
    placementStore.addStudentApplication({
      studentName: studentDisplayName,
      regNo: studentRoll,
      rollNo: studentRoll,
      branch: studentBranch,
      deptCode: 'CSE',
      cgpa: 8.42,
      company: intern.company,
      jobRole: internRole,
      ctcOffered: intern.stipend || 'Stipend based',
      notes: 'Applied via student Internship Portal section.',
    })
    showToast(`Application submitted for "${internRole}" at ${intern.company}. You will receive updates at your registered email.`)
  }

  return (
    <div className="internship-page">
      {/* ── Top Header Strip ── */}
      <div className="internship-header">
        <div>
          <p className="internship-kicker"><Briefcase size={13} />TRAINING &amp; PLACEMENT CELL · CSE</p>
          <h2>Internship Portal</h2>
          <p className="internship-caption">Manage enrollments, track industry internship drives, complete evaluations, quizzes, and viva defense.</p>
        </div>
        <div className="internship-stats">
          <div><strong>1</strong><small>Enrolled Active</small></div>
          <div><strong>3</strong><small>Applications</small></div>
          <div><strong>10</strong><small>Credits Accrued</small></div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROW FORMAT MENU (EXACT SCREENSHOT MATCH)
          `(o) Internship v`  |  `» Dashboard`  `» Internship Drives`  `» Enrollment`  `» Feedback`  `» Certificate`  `» Quiz`
          ───────────────────────────────────────────────────────────── */}
      <div className="internship-row-nav-wrapper">
        <div className="internship-row-nav-bar" role="navigation" aria-label="Internship Sections">
          <div className="internship-row-brand">
            <span className="internship-brand-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </span>
            <span className="internship-brand-text">Internship</span>
            <ChevronDown size={14} className="internship-brand-chevron" />
          </div>

          <div className="internship-row-items">
            {INTERNSHIP_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id
              return (
                <button
                  key={sec.id}
                  type="button"
                  className={`internship-row-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveSection(sec.id)}
                >
                  {sec.isBell ? (
                    <Bell size={13} className="sec-bell-icon" />
                  ) : (
                    <span className="sec-chevron">»</span>
                  )}
                  <span>{sec.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="internship-apply-msg" style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: DASHBOARD (INTERNSHIP STUDENT PROFILE - EXACT MATCH)
          ───────────────────────────────────────────────────────────── */}
      {activeSection === 'dashboard' && (
        <div className="internship-dashboard-section">
          {/* Exact match to User Screenshots: Info, Attendance, Evaluation & Marks, ID Card */}
          <ErrorBoundary
            title="Internship Profile Unavailable"
            message="An error occurred while displaying the student internship profile. Try refreshing or switching tabs."
          >
            <InternshipStudentProfile account={account} />
          </ErrorBoundary>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION: INTERNSHIP OPPORTUNITIES (MANAGED & PUBLISHED BY T&P CELL)
          ───────────────────────────────────────────────────────────── */}
      {activeSection === 'opportunities' && (
        <div className="internship-opportunities-section" style={{ padding: '0 0 24px 0' }}>
          <div className="erp-section-header-row" style={{ marginBottom: '16px' }}>
            <div className="erp-section-title">
              <Briefcase size={20} className="erp-list-icon" color="#2563eb" />
              <span>Published Corporate Internship Drives ({filteredInternships.length})</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by company, role, skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  width: '260px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredInternships.map((intern) => {
              const isClosed = (intern.status || '').toLowerCase() === 'closed'
              const isApplied = applied[intern.id]
              const skills = intern.requiredSkills || intern.skills || []

              return (
                <div
                  key={intern.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: intern.color || '#2563eb',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {intern.logo || (intern.company ? intern.company.slice(0, 2).toUpperCase() : 'IN')}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                            {intern.role || intern.title}
                          </h4>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                            {intern.company}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isClosed ? '#f1f5f9' : '#ecfdf5',
                        color: isClosed ? '#64748b' : '#059669',
                        border: `1px solid ${isClosed ? '#cbd5e1' : '#a7f3d0'}`
                      }}>
                        {isClosed ? 'Closed' : intern.workMode || 'Active'}
                      </span>
                    </div>

                    <p style={{ margin: '8px 0 12px', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                      {intern.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', fontSize: '11px', color: '#334155' }}>
                      <span style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#059669', fontWeight: 700 }}>💰</span> {intern.stipend || 'Stipend'}
                      </span>
                      <span style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} color="#64748b" /> {intern.duration || '2 Months'}
                      </span>
                      <span style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CalendarDays size={11} color="#64748b" /> Deadline: {intern.deadline}
                      </span>
                      {intern.minCgpa && (
                        <span style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={11} color="#2563eb" /> Min CGPA: {intern.minCgpa}
                        </span>
                      )}
                    </div>

                    {skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                        {skills.map((s, idx) => (
                          <span key={idx} style={{ background: '#f1f5f9', color: '#475569', fontSize: '10.5px', padding: '2px 7px', borderRadius: '4px', fontWeight: 500 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="erp-btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                      onClick={() => setSelectedInternDetail(intern)}
                    >
                      View Details
                    </button>
                    {isClosed ? (
                      <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Closed</span>
                    ) : isApplied ? (
                      <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary-internship"
                        style={{ fontSize: '11.5px', padding: '6px 14px' }}
                        onClick={() => applyFor(intern)}
                      >
                        Apply for Internship →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: ENROLLMENT (EXACT MATCH IMAGE 3)
          ───────────────────────────────────────────────────────────── */}
      {activeSection === 'enrollment' && (
        <div className="erp-enrollment-container">
          {/* Header matching Image 3: := My Enrollments with action button */}
          <div className="erp-section-header-row">
            <div className="erp-section-title">
              <ListIcon size={20} className="erp-list-icon" />
              <span>My Enrollments</span>
            </div>
            <button
              type="button"
              className="erp-btn-primary-action"
              onClick={() => setShowEnrollModal(true)}
            >
              + Apply / Enroll Company
            </button>
          </div>

          {/* Top Search / Filter Strip matching Image 3 */}
          <div className="erp-enrollment-bar">
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Internship Cell Registered Companies &amp; Off-Campus Approvals
            </span>
          </div>

          {/* Subtitle counter matching Image 3 */}
          <div className="erp-table-counter">
            Showing 1-{filteredEnrollmentRecords.length} of {enrollmentRecords.length} items.
          </div>

          {/* Table matching Image 3 */}
          <div className="erp-table-responsive">
            <table className="erp-portal-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>Company</th>
                  <th>Course</th>
                  <th>Preference</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
                <tr className="erp-table-filter-row">
                  <td></td>
                  <td>
                    <input
                      type="text"
                      className="erp-table-filter-input"
                      value={enrollFilters.company}
                      onChange={(e) => setEnrollFilters({ ...enrollFilters, company: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="erp-table-filter-input"
                      value={enrollFilters.course}
                      onChange={(e) => setEnrollFilters({ ...enrollFilters, course: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="erp-table-filter-input"
                      value={enrollFilters.preference}
                      onChange={(e) => setEnrollFilters({ ...enrollFilters, preference: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="erp-table-filter-input"
                      value={enrollFilters.description}
                      onChange={(e) => setEnrollFilters({ ...enrollFilters, description: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="erp-table-filter-input"
                      value={enrollFilters.status}
                      onChange={(e) => setEnrollFilters({ ...enrollFilters, status: e.target.value })}
                    />
                  </td>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollmentRecords.length === 0 ? (
                  <tr className="erp-no-results-row">
                    <td colSpan={6}>No results found.</td>
                  </tr>
                ) : (
                  filteredEnrollmentRecords.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td>{item.company}</td>
                      <td>{item.course}</td>
                      <td>{item.preference}</td>
                      <td>{item.description}</td>
                      <td>
                        <span className={`erp-badge-status ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: FEEDBACK
          ───────────────────────────────────────────────────────────── */}
      {activeSection === 'feedback' && (
        <div className="internship-feedback-section">
          <div className="internship-sub-header">
            <h3><Star size={16} />Internship Experience &amp; Appraisal Feedback</h3>
            <p>Provide ratings and constructive reviews on your company work experience to assist the department and future student batches.</p>
          </div>

          <div className="internship-form-card">
            <h4 style={{ margin: '0 0 16px', color: '#1e3a5f', fontSize: '14px', fontWeight: 700 }}>
              ⭐ Internship Appraisal Form (TechSurge India)
            </h4>
            <form onSubmit={handleFeedbackSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                <div className="form-group-item">
                  <label>1. Technical Mentorship &amp; Guidance</label>
                  <div className="rating-pills-row">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`rating-pill-btn ${feedbackRatings.technical === num ? 'active' : ''}`}
                        onClick={() => setFeedbackRatings({ ...feedbackRatings, technical: num })}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group-item">
                  <label>2. Real-World Relevance to Curriculum</label>
                  <div className="rating-pills-row">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`rating-pill-btn ${feedbackRatings.mentorship === num ? 'active' : ''}`}
                        onClick={() => setFeedbackRatings({ ...feedbackRatings, mentorship: num })}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group-item">
                  <label>3. Work Environment &amp; Team Culture</label>
                  <div className="rating-pills-row">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`rating-pill-btn ${feedbackRatings.culture === num ? 'active' : ''}`}
                        onClick={() => setFeedbackRatings({ ...feedbackRatings, culture: num })}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group-item">
                  <label>4. Stipend Disbursement &amp; Facilities</label>
                  <div className="rating-pills-row">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`rating-pill-btn ${feedbackRatings.stipend === num ? 'active' : ''}`}
                        onClick={() => setFeedbackRatings({ ...feedbackRatings, stipend: num })}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group-item">
                  <label>5. Overall Recommendation Score</label>
                  <div className="rating-pills-row">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`rating-pill-btn ${feedbackRatings.overall === num ? 'active' : ''}`}
                        onClick={() => setFeedbackRatings({ ...feedbackRatings, overall: num })}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group-item" style={{ marginBottom: '14px' }}>
                <label>Key Tools, Frameworks &amp; Skills Acquired</label>
                <textarea
                  className="form-textarea-field"
                  value={feedbackComments.learnings}
                  onChange={(e) => setFeedbackComments({ ...feedbackComments, learnings: e.target.value })}
                />
              </div>

              <div className="form-group-item" style={{ marginBottom: '16px' }}>
                <label>Advice &amp; Preparation Tips for Juniors</label>
                <textarea
                  className="form-textarea-field"
                  value={feedbackComments.suggestions}
                  onChange={(e) => setFeedbackComments({ ...feedbackComments, suggestions: e.target.value })}
                />
              </div>

              <div className="form-actions-bar">
                <button type="submit" className="btn-primary-internship">
                  <CheckCircle2 size={14} /> Submit Feedback Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: CERTIFICATE (EXACT MATCH IMAGE 2)
          ───────────────────────────────────────────────────────────── */}
      {activeSection === 'certificate' && (
        <div className="erp-certificate-container">
          {/* Top Yellow Notice Banner matching Image 2 */}
          <div className="erp-notice-banner">
            Certificate upload open until <strong>30-10-2026.</strong>
          </div>

          {/* Header matching Image 2: := My Internship Certificates with green [Upload] button */}
          <div className="erp-section-header-row">
            <div className="erp-section-title">
              <ListIcon size={20} className="erp-list-icon" />
              <span>My Internship Certificates</span>
            </div>
            <button
              type="button"
              className="erp-btn-green"
              onClick={() => setShowCertUploadModal(true)}
            >
              Upload
            </button>
          </div>

          {/* Subtitle counter matching Image 2 */}
          <div className="erp-table-counter">
            Showing 1-{filteredCertificates.length} of {certificateRecords.length} items.
          </div>

          {/* Table matching Image 2 */}
          <div className="erp-table-responsive">
            <table className="erp-portal-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>Uploaded By</th>
                  <th>Download</th>
                  <th>Status</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
                <tr className="erp-table-filter-row">
                  <td></td>
                  <td>
                    <input
                      type="text"
                      className="erp-table-filter-input"
                      value={certFilters.uploadedBy}
                      onChange={(e) => setCertFilters({ ...certFilters, uploadedBy: e.target.value })}
                    />
                  </td>
                  <td></td>
                  <td>
                    <input
                      type="text"
                      className="erp-table-filter-input"
                      value={certFilters.status}
                      onChange={(e) => setCertFilters({ ...certFilters, status: e.target.value })}
                    />
                  </td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map((cert, idx) => (
                  <tr key={cert.id}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td>{cert.uploadedBy}</td>
                    <td>
                      <button
                        type="button"
                        className="erp-btn-blue"
                        onClick={() => setSelectedCertPreview(cert)}
                      >
                        Download
                      </button>
                    </td>
                    <td>
                      <span className="erp-status-approved-thumb">
                        <span className="erp-thumb-emoji" role="img" aria-label="Approved">👍</span> Approved
                      </span>
                    </td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: QUIZ
          ───────────────────────────────────────────────────────────── */}
      {activeSection === 'quiz' && (
        <div className="internship-quiz-section">
          <div className="internship-sub-header">
            <h3><HelpCircle size={16} />Internship &amp; Industry Readiness Quizzes</h3>
            <p>Mandatory skill assessments required before and during industrial internships.</p>
          </div>

          <div className="quiz-grid">
            {quizzes.map((q) => (
              <div key={q.id} className="quiz-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className={`badge-status ${q.passed ? 'approved' : 'pending'}`}>
                      {q.passed ? `Cleared (${q.score}%)` : 'Not Attempted'}
                    </span>
                    <small style={{ color: '#64748b' }}>{q.duration}</small>
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#0f172a' }}>{q.title}</h4>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                    Covers key technical protocols, industry practices, and workplace performance standards.
                  </p>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb' }}>
                    Badge: {q.badge}
                  </span>
                  <button
                    type="button"
                    className="btn-primary-internship"
                    style={{ fontSize: '11.5px', padding: '6px 12px' }}
                    onClick={() => {
                      setActiveQuizModal(true)
                      showToast(`Starting ${q.title}...`)
                    }}
                  >
                    {q.passed ? 'Retake Quiz' : 'Start Quiz'} →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeQuizModal && (
            <div className="internship-form-card" style={{ borderColor: '#3b82f6', background: '#f8faff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, color: '#1e3a5f', fontSize: '14px' }}>
                  📝 Active Assessment: Python, System Design &amp; Problem Solving
                </h4>
                <button
                  type="button"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', fontWeight: 700 }}
                  onClick={() => setActiveQuizModal(false)}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                <div>
                  <strong>Q1. In a Python asyncio pipeline, which keyword is used to pause execution until a coroutine completes?</strong>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <label><input type="radio" name="q1" checked={quizAnswers.q1 === 'a'} onChange={() => setQuizAnswers({ ...quizAnswers, q1: 'a' })} /> yield</label>
                    <label><input type="radio" name="q1" checked={quizAnswers.q1 === 'b'} onChange={() => setQuizAnswers({ ...quizAnswers, q1: 'b' })} /> await</label>
                    <label><input type="radio" name="q1" checked={quizAnswers.q1 === 'c'} onChange={() => setQuizAnswers({ ...quizAnswers, q1: 'c' })} /> defer</label>
                  </div>
                </div>

                <div>
                  <strong>Q2. What is the primary purpose of a reverse proxy like NGINX in production web architectures?</strong>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <label><input type="radio" name="q2" checked={quizAnswers.q2 === 'a'} onChange={() => setQuizAnswers({ ...quizAnswers, q2: 'a' })} /> Database indexing</label>
                    <label><input type="radio" name="q2" checked={quizAnswers.q2 === 'c'} onChange={() => setQuizAnswers({ ...quizAnswers, q2: 'c' })} /> Load balancing &amp; SSL termination</label>
                    <label><input type="radio" name="q2" checked={quizAnswers.q2 === 'b'} onChange={() => setQuizAnswers({ ...quizAnswers, q2: 'b' })} /> CSS compilation</label>
                  </div>
                </div>

                <div>
                  <strong>Q3. When collaborating via Git, which command safely incorporates upstream remote changes without rewriting branch commit history?</strong>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <label><input type="radio" name="q3" checked={quizAnswers.q3 === 'a'} onChange={() => setQuizAnswers({ ...quizAnswers, q3: 'a' })} /> git pull --no-rebase</label>
                    <label><input type="radio" name="q3" checked={quizAnswers.q3 === 'b'} onChange={() => setQuizAnswers({ ...quizAnswers, q3: 'b' })} /> git reset --hard</label>
                  </div>
                </div>
              </div>

              <div className="form-actions-bar" style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-primary-internship"
                  onClick={() => {
                    setActiveQuizModal(false)
                    setQuizzes((prev) =>
                      prev.map((q) => (q.id === 'quiz-3' ? { ...q, score: 100, passed: true, badge: 'Gold Certified' } : q))
                    )
                    showToast('Quiz submitted! Score: 100% · Passed with Gold Badge ✓')
                  }}
                >
                  Submit &amp; View Score
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 3: UPLOAD INTERNSHIP CERTIFICATE (INTERNSHIP CELL)
          ═════════════════════════════════════════════════════════════ */}
      {showCertUploadModal && (
        <div className="erp-modal-overlay" onClick={() => setShowCertUploadModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} color="#00a65a" />
                <h4 style={{ margin: 0, fontSize: '15px', color: '#1e3a5f' }}>
                  Upload Internship Certificate
                </h4>
              </div>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setShowCertUploadModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="erp-modal-notice" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
              ✓ <strong>Approved by Internship Cell:</strong> Upload your official completion certificate provided by your training employer. Once vetted, academic credits and approval status are automatically posted.
            </div>

            <form onSubmit={handleUploadCertSubmit}>
              <div className="erp-form-grid">
                <div className="erp-form-group">
                  <label>Uploaded By (Student)</label>
                  <input
                    type="text"
                    className="erp-form-input"
                    value={studentUploadedBy}
                    disabled
                    style={{ background: '#f8fafc', color: '#64748b' }}
                  />
                </div>
                <div className="erp-form-group">
                  <label>Training Employer / Company *</label>
                  <select
                    className="erp-form-select"
                    value={certUploadForm.company}
                    onChange={(e) => setCertUploadForm({ ...certUploadForm, company: e.target.value })}
                  >
                    {APPROVED_COMPANIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {certUploadForm.company === 'Other (Manually Write Company Details)' && (
                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Specify Custom Company Name *</label>
                    <input
                      type="text"
                      className="erp-form-input"
                      value={certUploadForm.customCompany}
                      onChange={(e) => setCertUploadForm({ ...certUploadForm, customCompany: e.target.value })}
                      placeholder="e.g. Siemens Energy India Ltd."
                      required
                    />
                  </div>
                )}

                <div className="erp-form-group">
                  <label>Course / Specialization</label>
                  <select
                    className="erp-form-select"
                    value={certUploadForm.course}
                    onChange={(e) => setCertUploadForm({ ...certUploadForm, course: e.target.value })}
                  >
                    {COURSE_OPTIONS.map((co) => (
                      <option key={co} value={co}>{co}</option>
                    ))}
                  </select>
                </div>

                <div className="erp-form-group">
                  <label>Completion Date</label>
                  <input
                    type="date"
                    className="erp-form-input"
                    value={certUploadForm.issueDate}
                    onChange={(e) => setCertUploadForm({ ...certUploadForm, issueDate: e.target.value })}
                  />
                </div>

                <div className="erp-form-group">
                  <label>Training Hours</label>
                  <input
                    type="number"
                    className="erp-form-input"
                    value={certUploadForm.hours}
                    onChange={(e) => setCertUploadForm({ ...certUploadForm, hours: e.target.value })}
                  />
                </div>

                <div className="erp-form-group">
                  <label>Grade Secured</label>
                  <select
                    className="erp-form-select"
                    value={certUploadForm.grade}
                    onChange={(e) => setCertUploadForm({ ...certUploadForm, grade: e.target.value })}
                  >
                    <option value="Grade O (Outstanding)">Grade O (Outstanding)</option>
                    <option value="Grade A+ (Excellent)">Grade A+ (Excellent)</option>
                    <option value="Grade A (Very Good)">Grade A (Very Good)</option>
                  </select>
                </div>
              </div>

              {/* File Attachment Simulation */}
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px dashed #cbd5e1', margin: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="#00a65a" />
                  <div>
                    <strong style={{ fontSize: '12px', display: 'block', color: '#1e293b' }}>
                      {certUploadForm.fileName}
                    </strong>
                    <small style={{ color: '#64748b' }}>Certificate PDF or Scanned Image document</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="erp-btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={() => showToast('Selected certificate file.')}
                >
                  <Upload size={12} style={{ display: 'inline', marginRight: 4 }} /> Browse
                </button>
              </div>

              <div className="erp-modal-footer">
                <button
                  type="button"
                  className="erp-btn-secondary"
                  onClick={() => setShowCertUploadModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="erp-btn-green" style={{ padding: '8px 16px', fontSize: '12.5px' }}>
                  <CheckCircle2 size={14} /> Submit Certificate for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 4: INTERNSHIP CERTIFICATE PREVIEW / PRINT
          ═════════════════════════════════════════════════════════════ */}
      {selectedCertPreview && (
        <div className="erp-modal-overlay" onClick={() => setSelectedCertPreview(null)}>
          <div className="erp-modal-card erp-cert-preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header no-print">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#00a65a" />
                <h4 style={{ margin: 0, fontSize: '15px', color: '#1e3a5f' }}>
                  Verified Internship Certificate Preview
                </h4>
              </div>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setSelectedCertPreview(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Certificate Sheet */}
            <div className="bonafide-document-sheet" style={{ border: '4px double #00a65a', background: '#fafdfb' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px' }}>🏆</span>
                <h2 style={{ margin: '4px 0', fontSize: '20px', color: '#0f172a', letterSpacing: '0.04em' }}>
                  CERTIFICATE OF INTERNSHIP COMPLETION
                </h2>
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                  ACCREDITED &amp; APPROVED BY COLLEGE INTERNSHIP CELL
                </span>
              </div>

              <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '13px', lineHeight: 1.8, color: '#334155' }}>
                This is proudly presented to
                <h3 style={{ margin: '6px 0', fontSize: '18px', color: '#047857' }}>
                  {selectedCertPreview.uploadedBy}
                </h3>
                bearing Roll No: <strong>{studentRoll}</strong> for successfully completing the Industrial Internship in
                {' '}<strong>{selectedCertPreview.course || 'CAD/CAM & CNC Machining'}</strong> at
                {' '}<strong>{selectedCertPreview.company}</strong>.
                <div style={{ marginTop: '10px' }}>
                  Evaluation: <strong>{selectedCertPreview.grade || 'Grade O (Outstanding)'}</strong> &nbsp;•&nbsp;
                  Duration: <strong>{selectedCertPreview.hours || '240 Hours'}</strong> &nbsp;•&nbsp;
                  Date of Issue: <strong>{selectedCertPreview.issueDate}</strong>
                </div>
              </div>

              <div className="bonafide-doc-sign-strip" style={{ marginTop: '30px' }}>
                <div className="bonafide-seal-box">
                  <div className="official-round-seal" style={{ borderColor: '#00a65a', color: '#00a65a' }}>
                    <span>★ INTERNSHIP CELL ★</span>
                    <strong>APPROVED</strong>
                    <small>APNA CAMPUS</small>
                  </div>
                </div>
                <div className="bonafide-signature-box">
                  <div className="signature-font" style={{ color: '#047857' }}>Er. S. Mohanty</div>
                  <strong style={{ display: 'block', fontSize: '12px', color: '#0f172a' }}>Director of Training</strong>
                  <span style={{ fontSize: '10.5px', color: '#64748b' }}>{selectedCertPreview.company}</span>
                </div>
              </div>
            </div>

            <div className="erp-modal-footer no-print">
              <button
                type="button"
                className="erp-btn-secondary"
                onClick={() => setSelectedCertPreview(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="erp-btn-green"
                style={{ padding: '7px 16px' }}
                onClick={() => {
                  window.print()
                  showToast('Printing / Saving Certificate PDF...')
                }}
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL 5: ENROLLMENT FORM (COMPANY SELECT OR MANUAL FILL)
          ═════════════════════════════════════════════════════════════ */}
      {showEnrollModal && (
        <div className="erp-modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#2563eb" />
                <h4 style={{ margin: 0, fontSize: '15px', color: '#1e3a5f' }}>
                  Internship Company Enrollment Application
                </h4>
              </div>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setShowEnrollModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="erp-modal-notice">
              📋 <strong>Approved by Internship Cell:</strong> Choose from our approved corporate partner list or manually fill company details for off-campus approval.
            </div>

            <form onSubmit={handleEnrollSubmit}>
              {/* Mode Selector Radio Options */}
              <div className="erp-enroll-mode-selector">
                <label className={`erp-mode-radio-card ${enrollForm.companyMode === 'select' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="companyMode"
                    value="select"
                    checked={enrollForm.companyMode === 'select'}
                    onChange={() => setEnrollForm({ ...enrollForm, companyMode: 'select' })}
                  />
                  <div>
                    <strong>Choose from Approved List</strong>
                    <small>Select from recognized industry partner enterprises</small>
                  </div>
                </label>

                <label className={`erp-mode-radio-card ${enrollForm.companyMode === 'manual' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="companyMode"
                    value="manual"
                    checked={enrollForm.companyMode === 'manual'}
                    onChange={() => setEnrollForm({ ...enrollForm, companyMode: 'manual' })}
                  />
                  <div>
                    <strong>Manually Write Company Details</strong>
                    <small>Fill details for self-identified or off-campus firms</small>
                  </div>
                </label>
              </div>

              <div className="erp-form-grid" style={{ marginTop: '14px' }}>
                {enrollForm.companyMode === 'select' ? (
                  <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Select Company from List *</label>
                    <select
                      className="erp-form-select"
                      value={enrollForm.selectedCompany}
                      onChange={(e) => setEnrollForm({ ...enrollForm, selectedCompany: e.target.value })}
                    >
                      {APPROVED_COMPANIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Company / Enterprise Name (Manual Fill) *</label>
                      <input
                        type="text"
                        className="erp-form-input"
                        value={enrollForm.manualCompany}
                        onChange={(e) => setEnrollForm({ ...enrollForm, manualCompany: e.target.value })}
                        placeholder="e.g. Glucian India Pvt. Ltd. / Central Tool Room"
                        required
                      />
                    </div>
                    <div className="erp-form-group">
                      <label>Company Location / City</label>
                      <input
                        type="text"
                        className="erp-form-input"
                        value={enrollForm.companyAddress}
                        onChange={(e) => setEnrollForm({ ...enrollForm, companyAddress: e.target.value })}
                        placeholder="e.g. Infocity, Bhubaneswar"
                      />
                    </div>
                    <div className="erp-form-group">
                      <label>Supervisor / HR Contact Email</label>
                      <input
                        type="email"
                        className="erp-form-input"
                        value={enrollForm.supervisorEmail}
                        onChange={(e) => setEnrollForm({ ...enrollForm, supervisorEmail: e.target.value })}
                        placeholder="hr@company.com"
                      />
                    </div>
                  </>
                )}

                <div className="erp-form-group">
                  <label>Course / Specialization Domain *</label>
                  <select
                    className="erp-form-select"
                    value={enrollForm.course}
                    onChange={(e) => setEnrollForm({ ...enrollForm, course: e.target.value })}
                  >
                    {COURSE_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {enrollForm.course === 'Other / Custom' && (
                  <div className="erp-form-group">
                    <label>Specify Custom Course *</label>
                    <input
                      type="text"
                      className="erp-form-input"
                      value={enrollForm.customCourse}
                      onChange={(e) => setEnrollForm({ ...enrollForm, customCourse: e.target.value })}
                      placeholder="e.g. Go Backend Microservices"
                      required
                    />
                  </div>
                )}

                <div className="erp-form-group">
                  <label>Preference Priority *</label>
                  <select
                    className="erp-form-select"
                    value={enrollForm.preference}
                    onChange={(e) => setEnrollForm({ ...enrollForm, preference: e.target.value })}
                  >
                    <option value="First">First</option>
                    <option value="Second">Second</option>
                    <option value="Third">Third</option>
                  </select>
                </div>

                <div className="erp-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Description / Notes</label>
                  <input
                    type="text"
                    className="erp-form-input"
                    value={enrollForm.description}
                    onChange={(e) => setEnrollForm({ ...enrollForm, description: e.target.value })}
                    placeholder="-- (or specify notes for Internship Cell review)"
                  />
                </div>
              </div>

              {/* Offer Letter / Permission document simulation */}
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px dashed #cbd5e1', margin: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="#2563eb" />
                  <div>
                    <strong style={{ fontSize: '12px', display: 'block', color: '#1e293b' }}>
                      {enrollForm.offerLetter}
                    </strong>
                    <small style={{ color: '#64748b' }}>Offer letter or Internship Cell Permission document attached</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="erp-btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={() => showToast('Offer letter / permission document re-selected.')}
                >
                  <Upload size={12} style={{ display: 'inline', marginRight: 4 }} /> Browse
                </button>
              </div>

              <div className="erp-modal-footer">
                <button
                  type="button"
                  className="erp-btn-secondary"
                  onClick={() => setShowEnrollModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="erp-btn-primary">
                  <CheckCircle2 size={14} /> Submit Application to Internship Cell
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Opportunity Full Details View */}
      {selectedInternDetail && (
        <div className="erp-modal-overlay" onClick={() => setSelectedInternDetail(null)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="erp-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: selectedInternDetail.color || '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {selectedInternDetail.logo || 'IN'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
                    {selectedInternDetail.role || selectedInternDetail.title}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                    {selectedInternDetail.company} · {selectedInternDetail.location}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="erp-modal-close"
                onClick={() => setSelectedInternDetail(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12.5px', color: '#334155' }}>
              <div>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>Role Description:</strong>
                <p style={{ margin: 0, lineHeight: 1.6, color: '#475569' }}>
                  {selectedInternDetail.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div><strong>Stipend:</strong> {selectedInternDetail.stipend || 'Unpaid / Training'}</div>
                <div><strong>Duration:</strong> {selectedInternDetail.duration || '2 Months'}</div>
                <div><strong>Work Mode:</strong> {selectedInternDetail.workMode || 'On-site'}</div>
                <div><strong>Application Deadline:</strong> {selectedInternDetail.deadline}</div>
                <div><strong>Minimum CGPA:</strong> {selectedInternDetail.minCgpa || 'No minimum'}</div>
                <div><strong>Vacancies:</strong> {selectedInternDetail.openings || 'Limited'} Openings</div>
              </div>

              <div>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>Eligible Branches:</strong>
                <span>
                  {Array.isArray(selectedInternDetail.eligibleBranches)
                    ? selectedInternDetail.eligibleBranches.join(', ')
                    : selectedInternDetail.eligibleBranches || 'All Branches'}
                </span>
              </div>

              <div>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>Application Instructions &amp; Required Documents:</strong>
                <p style={{ margin: 0, color: '#475569' }}>
                  {selectedInternDetail.applicationInstructions || 'Apply through student portal with updated profile.'}
                </p>
                <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                  Required: {selectedInternDetail.requiredDocs || 'Resume, College Bonafide/NOC'}
                </small>
              </div>

              {selectedInternDetail.contactInfo && (
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                  <strong>HR / Cell Contact:</strong> {selectedInternDetail.contactInfo}
                </div>
              )}
            </div>

            <div className="erp-modal-footer">
              <button
                type="button"
                className="erp-btn-secondary"
                onClick={() => setSelectedInternDetail(null)}
              >
                Close
              </button>
              {applied[selectedInternDetail.id] ? (
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={16} /> Application Already Submitted
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-primary-internship"
                  onClick={() => {
                    applyFor(selectedInternDetail)
                    setSelectedInternDetail(null)
                  }}
                >
                  <CheckCircle2 size={14} /> Submit Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
