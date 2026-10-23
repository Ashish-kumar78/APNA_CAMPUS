import { useState, useEffect } from 'react'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  UsersRound,
  CreditCard,
  Home,
  Utensils,
  BarChart3,
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
import DigitalAnswerSheetEvaluationSystem from './components/DigitalEvaluation/DigitalAnswerSheetEvaluationSystem.jsx'
import PublicTimetable from './components/PublicTimetable.jsx'
import { api } from './services/api.js'

const roleCopy = {
  super_admin: { label: 'Super Admin console', icon: ShieldCheck },
  management: { label: 'Management', icon: ShieldCheck },
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
  hostel: { label: 'Hostel operations', icon: Home },
  maintenance: { label: 'Maintenance', icon: ShieldCheck },
  non_teaching: { label: 'Non-teaching staff', icon: UsersRound },
}

const roleGroups = [
  { id: 'administration', label: 'Administration', tone: 'blue', icon: ShieldCheck, roles: ['super_admin', 'management', 'principal', 'admin'] },
  { id: 'academics', label: 'Academics', tone: 'green', icon: GraduationCap, roles: ['student', 'faculty', 'hod', 'exam_cell', 'admissions'] },
  { id: 'services', label: 'Campus Services', tone: 'orange', icon: Home, roles: ['accounts', 'library', 'placement', 'transport', 'hostel', 'warden', 'staff', 'canteen', 'maintenance', 'non_teaching'] },
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
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [account, setAccount] = useState(null)
  const [error, setError] = useState('')
  const [resetRequested, setResetRequested] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDigitalEvaluation, setShowDigitalEvaluation] = useState(false)
  const [digitalEvalRole, setDigitalEvalRole] = useState('faculty')
  const [activationModalOpen, setActivationModalOpen] = useState(false)
  const [activationTokenInput, setActivationTokenInput] = useState('')
  const [activeRoleGroup, setActiveRoleGroup] = useState('administration')
  const [selectedRole, setSelectedRole] = useState('')
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

    if (!selectedRole) {
      setError('Choose your role in Explore by Role before signing in.')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await api.login(identifier, password)
      if (!res?.success || !res?.user) {
        throw new Error('We could not verify those sign-in details. Please check your College ID and password.')
      }
      if (res.user.role !== selectedRole) {
        await api.logout()
        throw new Error(`This account belongs to ${roleCopy[res.user.role]?.label || res.user.role}. Select the matching role and sign in again.`)
      }
      setAccount(res.user)
    } catch (apiErr) {
      setError(apiErr?.message || 'Unable to sign in. Check your details and try again.')
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
    setIdentifier('')
    setPassword('')
    setSelectedRole('')
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
      portal = <SuperAdminPortal account={account} onLogout={handleLogout} />
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
    } else if (account.role === 'hostel') {
      portal = <HostelPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'transport') {
      portal = <TransportPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'placement') {
      portal = <PlacementPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'staff') {
      portal = <StaffPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'maintenance' || account.role === 'non_teaching') {
      portal = <StaffPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'canteen') {
      portal = <CanteenPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'admissions') {
      portal = <AdmissionsPortal account={account} onLogout={handleLogout} />
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

              <div className="erp-role-explorer" aria-label="Explore portals by role">
                <div className="erp-role-divider"><span /><b>OR</b><span /></div>
                <div className="erp-role-heading">
                  <div>
                    <h3>Explore by Role</h3>
                    <p>Choose your portal before signing in</p>
                  </div>
                  {selectedRole && <span className="erp-role-selected-label">{roleCopy[selectedRole]?.label}</span>}
                </div>
                <div className="erp-role-groups" role="tablist" aria-label="Portal categories">
                  {roleGroups.map((group) => (
                    <button
                      type="button"
                      key={group.id}
                      role="tab"
                      aria-selected={activeRoleGroup === group.id}
                      className={`erp-role-group-card ${group.tone} ${activeRoleGroup === group.id ? 'is-active' : ''}`}
                      onClick={() => setActiveRoleGroup(group.id)}
                    >
                      <group.icon size={18} aria-hidden="true" />
                      <span className="erp-role-group-copy"><strong>{group.label}</strong><small>{group.roles.length} Roles</small></span>
                      <ArrowRight size={15} aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <div className="erp-role-options" role="tabpanel" aria-label={`${roleGroups.find((group) => group.id === activeRoleGroup)?.label} roles`}>
                  <div className="erp-role-options-title">
                    <span>Select {roleGroups.find((group) => group.id === activeRoleGroup)?.label} Role:</span>
                    {selectedRole && <button type="button" onClick={() => setSelectedRole('')} aria-label="Clear selected role">×</button>}
                  </div>
                  <div className="erp-role-chips">
                    {roleGroups.find((group) => group.id === activeRoleGroup)?.roles.map((role) => (
                      <button
                        type="button"
                        key={role}
                        className={`erp-role-chip ${selectedRole === role ? 'is-selected' : ''}`}
                        aria-pressed={selectedRole === role}
                        onClick={() => { setSelectedRole(role); setError(''); }}
                      >
                        {roleCopy[role].label}<ArrowRight size={13} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  {selectedRole && <p className="erp-role-hint">Your role and permissions are verified by the server when you sign in.</p>}
                </div>
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

export default App
