import { useState, useEffect } from 'react'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
  UsersRound,
  CreditCard,
  Home,
  Utensils,
  ChevronDown,
  ChevronUp,
  BarChart3,
  LayoutGrid,
  Building2,
  Loader2,
} from 'lucide-react'
import './App.css'
import StudentPortal from './StudentPortal.jsx'
import AdminPortal from './components/AdminPortal.jsx'
import HodPortal from './components/HodPortal.jsx'
import FacultyPortal from './components/FacultyPortal.jsx'
import AccountsPortal from './components/AccountsPortal.jsx'
import HostelPortal from './components/HostelPortal.jsx'
import CanteenPortal from './components/CanteenPortal.jsx'
import SuperAdminPortal from './components/SuperAdminPortal.jsx'
import ManagementPortal from './components/ManagementPortal.jsx'
import PrincipalPortal from './components/PrincipalPortal.jsx'
import ExamCellPortal from './components/ExamCellPortal.jsx'
import LibraryPortal from './components/LibraryPortal.jsx'
import TransportPortal from './components/TransportPortal.jsx'
import PlacementPortal from './components/PlacementPortal.jsx'
import StaffPortal from './components/StaffPortal.jsx'
import AdmissionsPortal from './components/AdmissionsPortal.jsx'
import AccountActivationModal from './components/AccountActivationModal.jsx'
import UniversalWhatsAppLauncher from './components/CampusConnect/UniversalWhatsAppLauncher.jsx'
import ApnaAIChatbot from './components/Chatbot/ApnaAIChatbot.jsx'
import UnifiedFloatingAssistant from './components/Common/UnifiedFloatingAssistant.jsx'
import MarksManagementModule from './marks/MarksManagementModule.jsx'
import DigitalAnswerSheetEvaluationSystem from './components/DigitalEvaluation/DigitalAnswerSheetEvaluationSystem.jsx'
import PublicTimetable from './components/PublicTimetable.jsx'
import { api } from './services/api.js'
import { getActiveStudent, setActiveStudent, findStudentByQuery } from './services/studentStore.js'
import { getTimeGreeting } from './utils/timeGreeting.js'

const roleCopy = {
  super_admin: { label: 'Super Admin console', icon: ShieldCheck },
  management: { label: 'Governing board', icon: ShieldCheck },
  principal: { label: 'Principal office', icon: GraduationCap },
  admissions: { label: 'Admissions & intake', icon: GraduationCap },
  student: { label: 'Student portal', icon: GraduationCap },
  faculty: { label: 'Faculty portal', icon: BookOpen },
  hod: { label: 'HOD portal', icon: ShieldCheck },
  admin: { label: 'Administration', icon: ShieldCheck },
  accounts: { label: 'Accounts portal', icon: CreditCard },
  exam_cell: { label: 'Examination cell', icon: ShieldCheck },
  library: { label: 'Library portal', icon: BookOpen },
  warden: { label: 'Hostel portal', icon: Home },
  transport: { label: 'Transport fleet', icon: ShieldCheck },
  placement: { label: 'Placement cell', icon: ShieldCheck },
  staff: { label: 'Staff operations', icon: ShieldCheck },
  canteen: { label: 'Canteen portal', icon: Utensils },
}

const demoCategories = [
  {
    id: 'admin',
    title: 'Administration',
    count: '4 Roles',
    color: '#2563eb',
    bg: '#f0f7ff',
    border: '#dbeafe',
    icon: Building2,
    roles: [
      { key: 'super_admin', label: 'Super Admin' },
      { key: 'management', label: 'Management' },
      { key: 'principal', label: 'Principal' },
      { key: 'admin', label: 'Admin Ops' },
    ],
  },
  {
    id: 'academics',
    title: 'Academics',
    count: '5 Roles',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#dcfce7',
    icon: GraduationCap,
    roles: [
      { key: 'admissions', label: 'Admissions' },
      { key: 'hod', label: 'HOD' },
      { key: 'faculty', label: 'Faculty' },
      { key: 'student', label: 'Student' },
      { key: 'exam_cell', label: 'Exam Cell' },
    ],
  },
  {
    id: 'services',
    title: 'Campus Services',
    count: '6 Roles',
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#ffedd5',
    icon: Home,
    roles: [
      { key: 'accounts', label: 'Accounts' },
      { key: 'library', label: 'Library' },
      { key: 'placement', label: 'Placement' },
      { key: 'transport', label: 'Transport' },
      { key: 'warden', label: 'Hostel' },
      { key: 'staff', label: 'Staff (Labs)' },
    ],
  },
]

const CLIENT_FALLBACK_ACCOUNTS = {
  super_admin: {
    id: 'demo-superadmin',
    name: 'Er. Bikramaditya Patra',
    email: 'superadmin@gift.edu.in',
    role: 'super_admin',
    roleEnum: 'SUPER_ADMIN',
    identifier: 'superadmin',
    designation: 'Chief Enterprise Systems Architect',
    detail: 'Root System & Security Administrator',
    department: 'Office of Information Technology',
    phone: '+91 94370 00001',
    permissions: ['*'],
  },
  management: {
    id: 'demo-management',
    name: 'Shri Patitapaban Panda',
    email: 'management@gift.edu.in',
    role: 'management',
    roleEnum: 'MANAGEMENT',
    identifier: 'management',
    designation: 'Managing Trustee',
    detail: 'Institutional Governance & Oversight',
    department: 'Governing Body & Trust Board',
    phone: '+91 94370 00002',
    permissions: ['*'],
  },
  principal: {
    id: 'demo-principal',
    name: 'Dr. Sujit Kumar Khuntia',
    email: 'principal@gift.edu.in',
    role: 'principal',
    roleEnum: 'PRINCIPAL',
    identifier: 'principal',
    designation: 'Principal & Director',
    detail: 'Academic Council & Executive Head',
    department: 'Office of the Principal',
    phone: '+91 94370 00003',
    permissions: ['*'],
  },
  admin: {
    id: 'demo-admin',
    name: 'Sri Manoranjan Tripathy',
    email: 'admin@gift.edu.in',
    role: 'admin',
    roleEnum: 'ADMIN',
    identifier: 'admin',
    designation: 'Chief Administrative Officer',
    detail: 'Admissions, Records & Campus Services',
    department: 'Administrative Operations',
    phone: '+91 94370 00004',
    permissions: ['*'],
  },
  hod: {
    id: 'demo-hod',
    name: 'Dr. P. K. Pattnaik',
    email: 'hod@gift.edu.in',
    role: 'hod',
    roleEnum: 'HOD',
    identifier: 'hod',
    designation: 'Professor & Head of Department',
    detail: 'Department Administrator · CSE',
    department: 'Computer Science & Engineering',
    phone: '+91 94370 00005',
    permissions: ['academics', 'faculty_management'],
  },
  faculty: {
    id: 'demo-faculty',
    name: 'Dr. S. Mohanty',
    email: 'faculty@gift.edu.in',
    role: 'faculty',
    roleEnum: 'FACULTY',
    identifier: 'faculty',
    designation: 'Associate Professor',
    detail: 'Faculty · School of Computing',
    department: 'Computer Science & Engineering',
    phone: '+91 94370 00006',
    identity: 'FAC-042',
    permissions: ['attendance', 'grading'],
  },
  student: {
    id: 'demo-student',
    name: 'Rakesh Das',
    email: 'student@gift.edu.in',
    role: 'student',
    roleEnum: 'STUDENT',
    identifier: '2305201001',
    registrationNumber: '2305201001',
    identity: '2305201001',
    designation: 'Student',
    detail: 'B.Tech Semester 5 · Section A',
    department: 'Computer Science & Engineering',
    phone: '+91 98610 23010',
    permissions: ['view_grades', 'attend_classes'],
  },
  exam_cell: {
    id: 'demo-examcell',
    name: 'Prof. S. R. Mahapatra',
    email: 'examcell@gift.edu.in',
    role: 'exam_cell',
    roleEnum: 'EXAM_CELL',
    identifier: 'examcell',
    designation: 'Controller of Examinations',
    detail: 'Autonomous Examination Cell',
    department: 'Autonomous Examination Cell',
    phone: '+91 94370 00008',
    permissions: ['exam_management', 'question_paper_moderation'],
  },
  accounts: {
    id: 'demo-accounts',
    name: 'CA S. K. Agrawal',
    email: 'accounts@gift.edu.in',
    role: 'accounts',
    roleEnum: 'ACCOUNTS',
    identifier: 'accounts',
    designation: 'Chief Finance Officer',
    detail: 'Student Fee Ledgers & Payroll',
    department: 'Finance & Accounts Division',
    phone: '+91 94370 00009',
    permissions: ['fee_collection', 'payroll'],
  },
  library: {
    id: 'demo-library',
    name: 'Dr. B. K. Jena',
    email: 'library@gift.edu.in',
    role: 'library',
    roleEnum: 'LIBRARY',
    identifier: 'library',
    designation: 'Chief Librarian',
    detail: 'Central Autonomous Library',
    department: 'Learning Resource Centre',
    phone: '+91 94370 00010',
    permissions: ['book_circulation', 'cataloguing'],
  },
  placement: {
    id: 'demo-placement',
    name: 'Mr. Soumya Ranjan Das',
    email: 'placement@gift.edu.in',
    role: 'placement',
    roleEnum: 'PLACEMENT',
    identifier: 'placement',
    designation: 'Head - Corporate Relations',
    detail: 'Training & Placement Division',
    department: 'Industry Relations & Placements',
    phone: '+91 94370 00011',
    permissions: ['placement_drives', 'recruiter_liaison'],
  },
  transport: {
    id: 'demo-transport',
    name: 'Mr. Ramesh Behera',
    email: 'transport@gift.edu.in',
    role: 'transport',
    roleEnum: 'TRANSPORT',
    identifier: 'transport',
    designation: 'Transport Supervisor',
    detail: 'Fleet Operations & Campus Bus Routes',
    department: 'Logistics & Transport',
    phone: '+91 94370 00012',
    permissions: ['fleet_management', 'route_scheduling'],
  },
  warden: {
    id: 'demo-warden',
    name: 'Capt. (Retd) D. N. Rout',
    email: 'hostel@gift.edu.in',
    role: 'warden',
    roleEnum: 'HOSTEL_WARDEN',
    identifier: 'warden',
    designation: 'Chief Hostel Warden',
    detail: 'Gents & Ladies Hostels',
    department: 'Hostel Administration',
    phone: '+91 94370 00013',
    permissions: ['room_allocation', 'gatepass_approval'],
  },
  staff: {
    id: 'demo-staff',
    name: 'Mr. Ashok Kumar Jena',
    email: 'staff@gift.edu.in',
    role: 'staff',
    roleEnum: 'STAFF',
    identifier: 'staff',
    designation: 'Senior Technical Officer',
    detail: 'CSE Cloud & AI Advanced Labs',
    department: 'Computer Science & Engineering',
    phone: '+91 94370 00014',
    permissions: ['lab_equipment', 'maintenance'],
  },
  canteen: {
    id: 'demo-canteen',
    name: 'Mr. Rabindra Jena',
    email: 'canteen@gift.edu.in',
    role: 'canteen',
    roleEnum: 'CANTEEN',
    identifier: 'canteen',
    designation: 'Campus Catering Manager',
    detail: 'Food Court & Student Mess Operations',
    department: 'Food & Beverage Services',
    phone: '+91 94370 00015',
    permissions: ['mess_menu', 'meal_punching'],
  },
  admissions: {
    id: 'demo-admissions',
    name: 'Er. Sujata Mohapatra',
    email: 'admissions@gift.edu.in',
    role: 'admissions',
    roleEnum: 'ADMISSION',
    identifier: 'admissions',
    designation: 'Dean Admissions',
    detail: 'B.Tech & M.Tech Enrollment Cell',
    department: 'Admissions & Outreach Cell',
    phone: '+91 94370 00016',
    permissions: ['admission_approval', 'leads_management'],
  },
}

CLIENT_FALLBACK_ACCOUNTS['superadmin'] = CLIENT_FALLBACK_ACCOUNTS['super_admin']
CLIENT_FALLBACK_ACCOUNTS['examcell'] = CLIENT_FALLBACK_ACCOUNTS['exam_cell']
CLIENT_FALLBACK_ACCOUNTS['admission'] = CLIENT_FALLBACK_ACCOUNTS['admissions']
CLIENT_FALLBACK_ACCOUNTS['2305201001'] = CLIENT_FALLBACK_ACCOUNTS['student']

function App() {
  const [identifier, setIdentifier] = useState('2305201001')
  const [password, setPassword] = useState('gift123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [account, setAccount] = useState(null)
  const [error, setError] = useState('')
  const [resetRequested, setResetRequested] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState('admin')
  const [showDigitalEvaluation, setShowDigitalEvaluation] = useState(false)
  const [digitalEvalRole, setDigitalEvalRole] = useState('faculty')
  const [activationModalOpen, setActivationModalOpen] = useState(false)
  const [activationTokenInput, setActivationTokenInput] = useState('')
  const [showPublicTimetable, setShowPublicTimetable] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    async function validateSession() {
      try {
        const user = await api.getMe();
        if (user && user.success && user.user) {
          setAccount(user.user);
          return;
        }
      } catch (err) {
        console.info('Backend session check skipped or offline:', err?.message || err);
      }

      // Check for cached user session (preserves session during Render backend spin-up)
      try {
        const cached = localStorage.getItem('collegeflow_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.role) {
            setAccount(parsed);
          }
        }
      } catch (e) {}

      setIsInitializing(false);
    }

    if (typeof window !== 'undefined') {
      validateSession();
      const hash = window.location.hash || ''
      const search = window.location.search || ''
      if (hash.includes('timetable') || search.includes('timetable')) {
        setShowPublicTimetable(true)
      } else if (hash.includes('activate?token=')) {
        const tok = hash.split('activate?token=')[1]?.split('&')[0]
        if (tok) {
          setActivationTokenInput(tok)
          setActivationModalOpen(true)
        }
      } else if (search.includes('token=')) {
        const params = new URLSearchParams(search)
        const tok = params.get('token')
        if (tok) {
          setActivationTokenInput(tok)
          setActivationModalOpen(true)
        }
      }
    }
  }, [])

  async function handleLogin(event) {
    if (event && event.preventDefault) event.preventDefault()
    clearUrlHash()
    setError('')
    setResetRequested(false)
    setIsSubmitting(true)

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('apna_campus_sidebar_open');
        localStorage.setItem('apna_campus_sidebar_open', 'false');
      }
    } catch (e) {}

    try {
      const res = await api.login(identifier, password)
      if (res && res.success && res.user) {
        setAccount(res.user)
        return
      } else if (res && !res.success) {
        setError(res.message || 'Invalid college ID or password. Please try again.')
        return
      }
    } catch (apiErr) {
      console.warn('API login call failed, checking demo fallback accounts:', apiErr?.message || apiErr)
      const rawKey = identifier.trim().toLowerCase()
      const cleanKey = rawKey.replace(/[-_\s]/g, '')
      const fallback = CLIENT_FALLBACK_ACCOUNTS[rawKey] || CLIENT_FALLBACK_ACCOUNTS[cleanKey]
      if (fallback && (password === 'gift123' || password === 'password123' || password === 'admin123')) {
        setAccount(fallback)
        try {
          localStorage.setItem('collegeflow_user', JSON.stringify(fallback))
        } catch (e) {}
        return
      }
      setError(`Connection failed: ${apiErr.message || 'Unable to reach authentication server.'}`)
      return
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearUrlHash = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = ''
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }
  }

  async function handleQuickLogin(roleKey) {
    clearUrlHash()
    setError('')
    setResetRequested(false)
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('apna_campus_sidebar_open');
        localStorage.setItem('apna_campus_sidebar_open', 'false');
      }
    } catch (e) {}
    const demoIdentifierMap = {
      super_admin: 'superadmin',
      exam_cell: 'examcell',
    }
    const loginIdentifier = demoIdentifierMap[roleKey] || roleKey
    setIdentifier(roleKey)
    setPassword('gift123')
    setIsSubmitting(true)

    try {
      const res = await api.login(loginIdentifier, 'gift123')
      if (res && res.success && res.user) {
        setAccount(res.user)
        return
      }
    } catch (apiErr) {
      console.warn('Backend quick login failed or server sleeping, engaging resilient fallback:', apiErr?.message || apiErr)
    } finally {
      setIsSubmitting(false)
    }

    // Direct resilient login for all 16 demo roles (ensures instant access even during cloud cold-start)
    const fallback = CLIENT_FALLBACK_ACCOUNTS[roleKey] || CLIENT_FALLBACK_ACCOUNTS[loginIdentifier]
    if (fallback) {
      setAccount(fallback)
      try {
        localStorage.setItem('collegeflow_user', JSON.stringify(fallback))
      } catch (e) {}
      return
    }
    setError('Unable to connect to server for quick login.')
  }

  function handleLogout() {
    api.logout()
    clearUrlHash()
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('apna_campus_sidebar_open');
        localStorage.setItem('apna_campus_sidebar_open', 'false');
      }
    } catch (e) {}
    setAccount(null)
    setIdentifier('2305201001')
    setPassword('gift123')
    setError('')
    setResetRequested(false)
  }

  // Public Timetable View (one-click access without login)
  if (showPublicTimetable) {
    return (
      <PublicTimetable
        onClose={() => {
          setShowPublicTimetable(false)
          clearUrlHash()
        }}
      />
    )
  }

  // Show a loading screen while validating the current session.
  if (isInitializing) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#090d16',
        }}
      >
        <Loader2 className="erp-spin" size={40} style={{ color: '#22d3ee' }} />
      </div>
    )
  }

  // Digital Answer Sheet Evaluation System Fullscreen Overlay
  if (showDigitalEvaluation) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: '#090d16', overflow: 'hidden' }}>
        <DigitalAnswerSheetEvaluationSystem
          initialRole={digitalEvalRole}
          currentUser={account}
          onClose={() => setShowDigitalEvaluation(false)}
        />
      </div>
    )
  }

  if (account) {
    let portal = null
    if (account.role === 'super_admin') {
      portal = <SuperAdminPortal account={account} onLogout={handleLogout} onSwitchRole={handleQuickLogin} />
    } else if (account.role === 'management') {
      portal = <ManagementPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'principal') {
      portal = <PrincipalPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'admin') {
      portal = <AdminPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'hod') {
      portal = <HodPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'faculty') {
      portal = <FacultyPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'accounts') {
      portal = <AccountsPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'exam_cell') {
      portal = <ExamCellPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'library') {
      portal = <LibraryPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'warden') {
      portal = <HostelPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'transport') {
      portal = <TransportPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'placement') {
      portal = <PlacementPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'staff') {
      portal = <StaffPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'canteen') {
      portal = <CanteenPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'admissions') {
      portal = <AdmissionsPortal account={account} onLogout={handleLogout} onSwitchRole={handleQuickLogin} />
    } else if (account.role === 'student') {
      portal = <StudentPortal account={account} onLogout={handleLogout} />
    }

    if (portal) {
      return (
        <>
          <UniversalWhatsAppLauncher account={account} hideTrigger={true} />
          <ApnaAIChatbot account={account} hideTrigger={true} />
          <UnifiedFloatingAssistant account={account} />
          {portal}
        </>
      )
    }
  }

  return (
    <>
      <UniversalWhatsAppLauncher account={account} hideTrigger={true} />
      <ApnaAIChatbot account={account} hideTrigger={true} />
      <UnifiedFloatingAssistant account={account} />
      <main className="erp-split-page">
        <div className="erp-hero-panel">
          <div className="erp-hero-content">
            <header className="erp-top-brand-wrapper">
              <div className="erp-top-brand">
                <div className="erp-logo-box">
                  <img src="/logo.png" alt="Apna Campus Logo" className="erp-campus-logo" />
                </div>
                <div className="erp-brand-titles">
                  <span className="erp-brand-name">APNA CAMPUS</span>
                  <span className="erp-brand-tagline">AUTONOMOUS HIGHER EDUCATION PORTAL</span>
                </div>
              </div>
              <div className="erp-accreditation-chip">
                <ShieldCheck size={14} className="erp-chip-icon" />
                <span>NAAC A++ ACCREDITED</span>
              </div>
            </header>
            <div className="erp-hero-body">
              <div className="erp-hero-kicker">
                <span>LEARN</span>
                <span className="erp-kicker-sep">|</span>
                <span>GROW</span>
                <span className="erp-kicker-sep">|</span>
                <span>CONNECT</span>
                <span className="erp-kicker-line"></span>
              </div>
              <h1 className="erp-hero-title">
                A Smarter<br />
                <span className="erp-cyan-text">Campus Experience.</span>
              </h1>
              <div className="erp-hero-pills-row">
                <span>People</span>
                <span className="erp-dot">•</span>
                <span>Academics</span>
                <span className="erp-dot">•</span>
                <span>Administration</span>
                <span className="erp-dot">•</span>
                <span>Opportunities</span>
              </div>
              <div className="erp-hero-divider-bar" />
              <div className="erp-feature-indicators">
                <div
                  className="erp-feature-item"
                  style={{ cursor: 'pointer' }}
                  title="View Public Timetable"
                  onClick={() => setShowPublicTimetable(true)}
                >
                  <div className="erp-feature-icon-circle">
                    <Calendar size={16} />
                  </div>
                  <div className="erp-feature-text">
                    <span>Smart</span>
                    <span>Timetable</span>
                  </div>
                </div>
                <div className="erp-feature-item">
                  <div className="erp-feature-icon-circle">
                    <BarChart3 size={16} />
                  </div>
                  <div className="erp-feature-text">
                    <span>Digital</span>
                    <span>Evaluations</span>
                  </div>
                </div>
                <div className="erp-feature-item">
                  <div className="erp-feature-icon-circle">
                    <UsersRound size={16} />
                  </div>
                  <div className="erp-feature-text">
                    <span>Smart</span>
                    <span>Attendance</span>
                  </div>
                </div>
              </div>
              <div className="erp-stats-row">
                <div className="erp-stat-col">
                  <div className="erp-stat-num">
                    2,480<span className="erp-stat-plus">+</span>
                  </div>
                  <div className="erp-stat-label">STUDENTS</div>
                </div>
                <div className="erp-stat-divider" />
                <div className="erp-stat-col">
                  <div className="erp-stat-num">
                    146<span className="erp-stat-plus">+</span>
                  </div>
                  <div className="erp-stat-label">FACULTY</div>
                </div>
                <div className="erp-stat-divider" />
                <div className="erp-stat-col">
                  <div className="erp-stat-num">18</div>
                  <div className="erp-stat-label">PROGRAMS</div>
                </div>
              </div>
            </div>


          </div>
        </div>
        <section className="erp-login-section" aria-label="Sign In">
          <div className="erp-login-card">
            <div className="erp-card-brand-header">
              <h2 className="erp-card-title">Welcome Back</h2>
              <p className="erp-card-subtitle">Sign in to your Apna Campus account</p>
            </div>
            <form className="erp-login-form" onSubmit={handleLogin} noValidate>
              <div className="erp-field-group">
                <div className="erp-input-wrapper">
                  <UserRound className="erp-input-icon" size={17} aria-hidden="true" />
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="College ID / Registration Number"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              <div className="erp-field-group">
                <div className="erp-input-wrapper">
                  <LockKeyhole className="erp-input-icon" size={17} aria-hidden="true" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className="erp-password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="erp-options-row">
                <label className="erp-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="erp-text-link"
                  onClick={() => { setResetRequested((prev) => !prev); setError(''); }}
                >
                  Forgot password?
                </button>
              </div>
              {(error || resetRequested) && (
                <div
                  className={`erp-alert-box ${error ? 'is-error' : 'is-success'}`}
                  role="alert"
                  aria-live="polite"
                >
                  <span>{error || 'Password reset link sent to your registered college phone.'}</span>
                  <button
                    type="button"
                    className="erp-alert-close"
                    onClick={() => { setError(''); setResetRequested(false); }}
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>
                </div>
              )}
              <button
                type="submit"
                className="erp-primary-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="erp-spin" aria-hidden="true" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
              <div className="erp-sublink-row">
                <span className="erp-sublink-text">New user?</span>
                <button
                  type="button"
                  className="erp-highlight-link"
                  onClick={() => { setActivationModalOpen(true); setActivationTokenInput(''); }}
                >
                  Activate Account
                </button>
              </div>
              <div className="erp-section-divider">
                <span>OR</span>
              </div>
              <div className="erp-demo-section">
                <div className="erp-demo-header">
                  <h3 className="erp-demo-title">Explore by Role</h3>
                  <p className="erp-demo-subtitle">Explore the portal with different roles</p>
                </div>
                <div className="erp-category-cards-grid">
                  {demoCategories.map((cat) => {
                    const CatIcon = cat.icon
                    const isExpanded = expandedCategory === cat.id
                    return (
                      <div
                        key={cat.id}
                        className={`erp-cat-card ${isExpanded ? 'active' : ''}`}
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                        role="button"
                        tabIndex={0}
                        style={{ '--cat-bg': cat.bg, '--cat-border': cat.border, '--cat-color': cat.color }}
                      >
                        <div className="erp-cat-top">
                          <div className="erp-cat-icon-box">
                            <CatIcon size={18} />
                          </div>
                          <ArrowRight size={13} className="erp-cat-arrow" />
                        </div>
                        <div className="erp-cat-bottom">
                          <strong className="erp-cat-name">{cat.title}</strong>
                          <span className="erp-cat-count">{cat.count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {expandedCategory && (
                  <div className="erp-expanded-roles-drawer">
                    <div className="erp-drawer-header">
                      <span>Select {demoCategories.find((c) => c.id === expandedCategory)?.title} Role:</span>
                      <button
                        type="button"
                        className="erp-drawer-close"
                        onClick={() => setExpandedCategory(null)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="erp-drawer-roles">
                      {demoCategories
                        .find((c) => c.id === expandedCategory)
                        ?.roles.map((r) => (
                          <button
                            key={r.key}
                            type="button"
                            className="erp-drawer-role-pill"
                            onClick={async () => {
                              await handleQuickLogin(r.key)
                            }}
                          >
                            <span>{r.label}</span>
                            <ArrowRight size={11} />
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
            <footer className="erp-card-footer">
              <div className="erp-footer-links">
                <a href="#help" onClick={(e) => e.preventDefault()}>Help</a>
                <span className="erp-footer-bar">|</span>
                <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy</a>
                <span className="erp-footer-bar">|</span>
                <a href="#contact" onClick={(e) => e.preventDefault()} >Contact</a>
              </div>
              <p className="erp-footer-copyright">
                © 2026 Apna Campus
              </p>
            </footer>
          </div>
        </section>
      </main>
      {activationModalOpen && (
        <AccountActivationModal
          initialToken={activationTokenInput}
          onClose={() => setActivationModalOpen(false)}
          onActivationSuccess={(user, token) => {
            setAccount(user)
            setActivationModalOpen(false)
          }}
        />
      )}
    </>
  )
}

function Dashboard({ account, onLogout }) {
  const { label, icon: RoleIcon } = roleCopy[account.role]

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <a className="dashboard-brand" href="#home" aria-label="Apna Campus">
          <GiftMark size={36} />
          <span>APNA CAMPUS</span>
        </a>
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-account-rail" aria-label="Signed-in account details">
          <div className="dashboard-rail-emblem"><RoleIcon size={27} /></div>
          <p className="eyebrow">CURRENT ACCOUNT</p>
          <h2>{account.name}</h2>
          <p className="dashboard-rail-detail">{account.detail}</p>
          <dl className="dashboard-rail-details">
            <div>
              <dt>{account.role === 'student' ? 'Registration number' : 'College ID'}</dt>
              <dd>{account.registrationNumber || account.identity}</dd>
            </div>
            <div><dt>Department</dt><dd>{account.department}</dd></div>
            <div><dt>Account type</dt><dd>{label}</dd></div>
          </dl>
          <div className="dashboard-rail-status"><span />Account active</div>
          <button
            type="button"
            onClick={onLogout}
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#e11d48',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              width: '100%',
              transition: 'background 0.2s',
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </aside>

        <section className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="welcome-row">
            <div>
              <p className="eyebrow"><RoleIcon size={15} />{label}</p>
              <h1>{account.role === 'admin' ? 'Campus overview' : 'Faculty Workspace'}</h1>
              <p className="welcome-detail">{getTimeGreeting()}, {account.name.split(' ')[0]}. Manage student continuous evaluation & assessments.</p>
            </div>
            <div className="today-chip"><CalendarDays size={15} /> Friday, 02 October 2026</div>
          </div>

          <section className="overview-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Academic Portal</p>
                <h2>{account.role === 'admin' ? 'Campus overview' : 'Quick metrics'}</h2>
              </div>
              <span className="live-status"><span />Academic year 2026–27</span>
            </div>
            <div className="overview-grid">
              {getOverview(account.role).map((item) => (
                <article className="overview-item" key={item.label}>
                  <div className={`overview-icon ${item.tone}`}><item.icon size={19} /></div>
                  <div className="overview-copy">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <small>{item.note}</small>
                  </div>
                  <ArrowRight size={16} className="overview-arrow" />
                </article>
              ))}
            </div>
          </section>

          {/* Full Marks Management Module embedded directly for faculty/admin */}
          <div style={{ marginTop: '0.5rem' }}>
            <MarksManagementModule initialRole="teacher" />
          </div>
        </section>
      </div>
    </main>
  )
}

function getOverview(role) {
  if (role === 'admin') {
    return [
      { icon: UsersRound, label: 'Students', value: '2,480', note: 'Across all programs', tone: 'blue' },
      { icon: GraduationCap, label: 'Faculty', value: '146', note: 'Teaching staff', tone: 'green' },
      { icon: BookOpen, label: 'Programs', value: '18', note: 'Active programs', tone: 'gold' },
    ]
  }
  if (role === 'faculty') {
    return [
      { icon: UsersRound, label: 'My students', value: '64', note: 'Across 2 sections', tone: 'blue' },
      { icon: BookOpen, label: 'Courses', value: '3', note: 'Assigned this term', tone: 'green' },
      { icon: CalendarDays, label: 'Next class', value: '10:30 AM', note: 'Data Structures · Room 204', tone: 'gold' },
    ]
  }
  return [
    { icon: BookOpen, label: 'Enrolled courses', value: '6', note: 'Semester 5', tone: 'blue' },
    { icon: CalendarDays, label: 'Next class', value: '10:30 AM', note: 'Data Structures · Room 204', tone: 'green' },
    { icon: Check, label: 'Attendance', value: '92%', note: 'This semester', tone: 'gold' },
  ]
}

function GiftMark({ size = 34 }) {
  return (
    <img
      src="/logo.png"
      alt="Apna Campus Logo"
      className="apna-campus-logo-img"
      style={{
        height: `${size}px`,
        width: 'auto',
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  )
}

export default App
