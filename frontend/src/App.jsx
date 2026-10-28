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
  Award,
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
  HardHat,
  Wrench,
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
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ExamCellPortal from './components/ExamCellPortal.jsx'
import LibraryPortal from './components/LibraryPortal.jsx'
import TransportPortal from './components/TransportPortal.jsx'
import PlacementPortal from './components/PlacementPortal.jsx'
import StaffPortal from './components/StaffPortal.jsx'
import AdmissionsPortal from './components/AdmissionsPortal.jsx'
import ScholarshipPortal from './components/ScholarshipPortal.jsx'
import CampusOperationsPortal from './components/CampusOperations/CampusOperationsPortal.jsx'
import AccountActivationModal from './components/AccountActivationModal.jsx'
import UniversalWhatsAppLauncher from './components/CampusConnect/UniversalWhatsAppLauncher.jsx'
import ApnaAIChatbot from './components/Chatbot/ApnaAIChatbot.jsx'
import UnifiedFloatingAssistant from './components/Common/UnifiedFloatingAssistant.jsx'
import MarksManagementModule from './marks/MarksManagementModule.jsx'
import DigitalAnswerSheetEvaluationSystem from './components/DigitalEvaluation/DigitalAnswerSheetEvaluationSystem.jsx'
import PublicTimetable from './components/PublicTimetable.jsx'
import IdCardVerificationView from './components/InternshipCell/IdCardVerificationView.jsx'
import ApnaCampusSymbol from './components/Branding/ApnaCampusSymbol.jsx'
import { api } from './services/api.js'
import { getActiveStudent, setActiveStudent, findStudentByQuery } from './services/studentStore.js'
import { getTimeGreeting, getGreetingDisplayName } from './utils/timeGreeting.js'

const accounts = {
  '2401432265': {
    role: 'student',
    name: 'BISHNU PRASAD SAHOO',
    registrationNumber: '2401432265',
    department: 'Computer Science & Engineering (Artificial Intelligence)',
    detail: 'BTECH 2028-P · CSE (AI) - Genius',
  },
  '2305201001': {
    role: 'student',
    name: 'Rakesh Das',
    registrationNumber: '2305201001',
    department: 'Computer Science & Engineering',
    detail: 'BTECH 2023–2027 · CSE (Sec A)',
  },
  'student': {
    role: 'student',
    name: 'Rakesh Das',
    registrationNumber: '2305201001',
    department: 'Computer Science & Engineering',
    detail: 'BTECH 2023–2027 · CSE (Sec A)',
  },
  'superadmin': {
    role: 'super_admin',
    name: 'Chief Systems Architect',
    identity: 'SYS-SUPER-01',
    department: 'Enterprise IT & Security',
    detail: 'Super Administrator · Full System Scope',
  },
  'super_admin': {
    role: 'super_admin',
    name: 'Chief Systems Architect',
    identity: 'SYS-SUPER-01',
    department: 'Enterprise IT & Security',
    detail: 'Super Administrator · Full System Scope',
  },
  'sys-super-01': {
    role: 'super_admin',
    name: 'Chief Systems Architect',
    identity: 'SYS-SUPER-01',
    department: 'Enterprise IT & Security',
    detail: 'Super Administrator · Full System Scope',
  },
  'SYS-SUPER-01': {
    role: 'super_admin',
    name: 'Chief Systems Architect',
    identity: 'SYS-SUPER-01',
    department: 'Enterprise IT & Security',
    detail: 'Super Administrator · Full System Scope',
  },
  'management': {
    role: 'management',
    name: 'Prof. (Dr.) S. P. Panda',
    identity: 'GOV-CHAIR-01',
    department: 'Governing Board / Trustees',
    detail: 'Chairman & Governing Body Trustee',
  },
  'GOV-CHAIR-01': {
    role: 'management',
    name: 'Prof. (Dr.) S. P. Panda',
    identity: 'GOV-CHAIR-01',
    department: 'Governing Board / Trustees',
    detail: 'Chairman & Governing Body Trustee',
  },
  'director': {
    role: 'management',
    name: 'Prof. (Dr.) S. P. Panda',
    identity: 'GOV-CHAIR-01',
    department: 'Governing Board / Trustees',
    detail: 'Chairman & Governing Body Trustee',
  },
  'principal': {
    role: 'principal',
    name: 'Dr. B. K. Sarap',
    identity: 'OFF-PRIN-01',
    department: 'Office of the Principal',
    detail: 'Principal & Director · Autonomous Campus',
  },
  'OFF-PRIN-01': {
    role: 'principal',
    name: 'Dr. B. K. Sarap',
    identity: 'OFF-PRIN-01',
    department: 'Office of the Principal',
    detail: 'Principal & Director · Autonomous Campus',
  },
  'faculty': {
    role: 'faculty',
    name: 'Dr. S. Mohanty',
    identity: 'FAC-042',
    department: 'Computer Science & Engineering',
    detail: 'Faculty · School of Computing',
  },
  'fac-042': {
    role: 'faculty',
    name: 'Dr. S. Mohanty',
    identity: 'FAC-042',
    department: 'Computer Science & Engineering',
    detail: 'Faculty · School of Computing',
  },
  'hod': {
    role: 'hod',
    name: 'Dr. P. K. Pattnaik',
    identity: 'HOD-CSE',
    department: 'Computer Science & Engineering',
    detail: 'Head of Department · CSE',
  },
  'hod-cse': {
    role: 'hod',
    name: 'Dr. P. K. Pattnaik',
    identity: 'HOD-CSE',
    department: 'Computer Science & Engineering',
    detail: 'Head of Department · CSE',
  },
  'admin': {
    role: 'admin',
    name: 'Campus Administrator',
    identity: 'ADM-001',
    department: 'Apna Campus',
    detail: 'System administrator',
  },
  'adm-001': {
    role: 'admin',
    name: 'Campus Administrator',
    identity: 'ADM-001',
    department: 'Apna Campus',
    detail: 'System administrator',
  },
  'accounts': {
    role: 'accounts',
    name: 'Mr. S. K. Roy',
    identity: 'ACC-012',
    department: 'Finance & Accounts',
    detail: 'Senior Accounts Officer',
  },
  'exam_cell': {
    role: 'exam_cell',
    name: 'Dr. K. C. Patra',
    identity: 'COE-EXAM-01',
    department: 'Autonomous Examination Cell',
    detail: 'Controller of Examinations (CoE)',
  },
  'examcell': {
    role: 'exam_cell',
    name: 'Dr. K. C. Patra',
    identity: 'COE-EXAM-01',
    department: 'Autonomous Examination Cell',
    detail: 'Controller of Examinations (CoE)',
  },
  'library': {
    role: 'library',
    name: 'Dr. Rabindra K. Jena',
    identity: 'LIB-HEAD-01',
    department: 'Central University Library',
    detail: 'Chief Librarian & Information Officer',
  },
  'warden': {
    role: 'warden',
    name: 'Mrs. Nibedita Das',
    identity: 'WRD-004',
    department: 'Hostel Administration',
    detail: 'Chief Resident Warden',
  },
  'hostel_admin': {
    role: 'hostel_admin',
    name: 'Mr. Rajesh Jena',
    identity: 'WRD-ADM-01',
    department: 'Hostel Administration Office',
    detail: 'Hostel Chief Administrator & Housing Ops',
  },
  'wrd-adm-01': {
    role: 'hostel_admin',
    name: 'Mr. Rajesh Jena',
    identity: 'WRD-ADM-01',
    department: 'Hostel Administration Office',
    detail: 'Hostel Chief Administrator & Housing Ops',
  },
  'scholarship': {
    role: 'scholarship',
    name: 'Dr. M. K. Mohapatra',
    identity: 'SCH-OFF-01',
    department: 'Scholarship & Student Financial Aid Directorate',
    detail: 'Director & Chief Scholarship Officer',
  },
  'sch-off-01': {
    role: 'scholarship',
    name: 'Dr. M. K. Mohapatra',
    identity: 'SCH-OFF-01',
    department: 'Scholarship & Student Financial Aid Directorate',
    detail: 'Director & Chief Scholarship Officer',
  },
  'transport': {
    role: 'transport',
    name: 'Mr. Jagannath Sahoo',
    identity: 'TRANS-FLEET-01',
    department: 'Campus Transport Division',
    detail: 'Fleet & Transit Manager',
  },
  'placement': {
    role: 'placement',
    name: 'Prof. Sudhanshu S. Ray',
    identity: 'TPO-HEAD-01',
    department: 'Training & Placement Cell',
    detail: 'Head of Corporate Relations & Placements',
  },
  'staff': {
    role: 'staff',
    name: 'Mr. Biswajit Sahoo',
    identity: 'STF-OPS-09',
    department: 'Campus Technical & Lab Operations',
    detail: 'Senior Technical Staff',
  },
  'canteen': {
    role: 'canteen',
    name: 'Mr. B. K. Sahoo',
    identity: 'CAN-007',
    department: 'Hospitality & Dining',
    detail: 'Smart Canteen Supervisor',
  },
  'admissions': {
    role: 'admissions',
    name: 'Ms. Sasmita Mohapatra',
    identity: 'ADM-OFF-01',
    department: 'Admissions & Student Intake Office',
    detail: 'Senior Admissions Officer · Admissions & Counseling',
  },
  'admission': {
    role: 'admissions',
    name: 'Ms. Sasmita Mohapatra',
    identity: 'ADM-OFF-01',
    department: 'Admissions & Student Intake Office',
    detail: 'Senior Admissions Officer · Admissions & Counseling',
  },
  'adm-off-01': {
    role: 'admissions',
    name: 'Ms. Sasmita Mohapatra',
    identity: 'ADM-OFF-01',
    department: 'Admissions & Student Intake Office',
    detail: 'Senior Admissions Officer · Admissions & Counseling',
  },
  'maintenance': {
    role: 'staff',
    name: 'Mr. Pradeep Kumar Barik',
    identity: 'MTN-OPS-01',
    department: 'Estate Maintenance & Civil Works',
    detail: 'Estate Maintenance Supervisor',
  },
  'campus_operations': {
    role: 'campus_operations',
    name: 'Mr. Ramesh Chandra Parida',
    identity: 'OPS-DIR-01',
    department: 'Estate Maintenance & Campus Operations',
    detail: 'Chief Campus Operations Officer · Facilities & Infrastructure',
  },
  'ops-dir-01': {
    role: 'campus_operations',
    name: 'Mr. Ramesh Chandra Parida',
    identity: 'OPS-DIR-01',
    department: 'Estate Maintenance & Campus Operations',
    detail: 'Chief Campus Operations Officer · Facilities & Infrastructure',
  },
}

const roleCopy = {
  super_admin: { label: 'Super Admin', icon: ShieldCheck },
  management: { label: 'Management', icon: ShieldCheck },
  principal: { label: 'Principal', icon: GraduationCap },
  admin: { label: 'Admin Office', icon: ShieldCheck },
  admissions: { label: 'Admission', icon: GraduationCap },
  hod: { label: 'HOD', icon: ShieldCheck },
  faculty: { label: 'Faculty', icon: BookOpen },
  student: { label: 'Students', icon: GraduationCap },
  exam_cell: { label: 'Examination', icon: ShieldCheck },
  staff: { label: 'Staff Lab', icon: ShieldCheck },
  library: { label: 'Library', icon: BookOpen },
  placement: { label: 'Placement', icon: ShieldCheck },
  accounts: { label: 'Accounts', icon: CreditCard },
  scholarship: { label: 'Scholarship', icon: Award },
  warden: { label: 'Warden', icon: Home },
  hostel_admin: { label: 'Hostel Admin', icon: Home },
  transport: { label: 'Transport', icon: ShieldCheck },
  campus_operations: { label: 'Campus Operations', icon: HardHat },
  canteen: { label: 'Canteen', icon: Utensils },
}

const demoCategories = [
  {
    id: 'admin',
    categoryCode: 'A',
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
      { key: 'admin', label: 'Admin Office' },
    ],
  },
  {
    id: 'academics',
    categoryCode: 'B',
    title: 'Academics',
    count: '10 Roles',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#dcfce7',
    icon: GraduationCap,
    roles: [
      { key: 'admissions', label: 'Admission' },
      { key: 'hod', label: 'HOD' },
      { key: 'faculty', label: 'Faculty' },
      { key: 'student', label: 'Students' },
      { key: 'exam_cell', label: 'Examination' },
      { key: 'staff', label: 'Staff Lab' },
      { key: 'library', label: 'Library' },
      { key: 'placement', label: 'Placement' },
      { key: 'accounts', label: 'Accounts' },
      { key: 'scholarship', label: 'Scholarship' },
    ],
  },
  {
    id: 'services',
    categoryCode: 'C',
    title: 'Campus Services',
    count: '5 Roles',
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#ffedd5',
    icon: Home,
    roles: [
      { key: 'warden', label: 'Warden' },
      { key: 'hostel_admin', label: 'Hostel Admin' },
      { key: 'transport', label: 'Transport' },
      { key: 'campus_operations', label: 'Campus Operations' },
      { key: 'canteen', label: 'Canteen' },
    ],
  },
]

function App() {
  const [identifier, setIdentifier] = useState('2305201001')
  const [password, setPassword] = useState('gift123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [account, setAccount] = useState(null)
  const [error, setError] = useState('')
  const [autoFillNotice, setAutoFillNotice] = useState('')
  const [resetRequested, setResetRequested] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState('admin')
  const [showDigitalEvaluation, setShowDigitalEvaluation] = useState(false)
  const [digitalEvalRole, setDigitalEvalRole] = useState('faculty')
  const [activationModalOpen, setActivationModalOpen] = useState(false)
  const [activationTokenInput, setActivationTokenInput] = useState('')
  const [showPublicTimetable, setShowPublicTimetable] = useState(false)
  const [verificationToken, setVerificationToken] = useState('')

  const adminRoleCredentials = {
    super_admin: {
      identifier: 'SYS-SUPER-01',
      password: 'gift123',
      label: 'Super Admin',
      roleName: 'Chief Systems Architect',
    },
    superadmin: {
      identifier: 'SYS-SUPER-01',
      password: 'gift123',
      label: 'Super Admin',
      roleName: 'Chief Systems Architect',
    },
    admin: {
      identifier: 'ADM-001',
      password: 'gift123',
      label: 'Campus Admin',
      roleName: 'Campus Administrator',
    },
    management: {
      identifier: 'GOV-CHAIR-01',
      password: 'gift123',
      label: 'Management / Director',
      roleName: 'Chairman & Governing Body',
    },
    principal: {
      identifier: 'OFF-PRIN-01',
      password: 'gift123',
      label: 'Principal',
      roleName: 'Office of the Principal',
    },
  }

  function handleRoleSelect(roleKey, categoryId) {
    clearUrlHash()
    setError('')
    setResetRequested(false)

    // For Administration section (Super Admin, Admin, Management, Principal),
    // auto-fill credentials and prompt user to click the "Login" button to authenticate.
    const isAdminRole = categoryId === 'admin' || Boolean(adminRoleCredentials[roleKey])

    if (isAdminRole) {
      const creds = adminRoleCredentials[roleKey] || {
        identifier: roleKey,
        password: 'gift123',
        label: roleKey,
      }
      setIdentifier(creds.identifier)
      setPassword(creds.password)
      setAutoFillNotice(
        `✓ Credentials auto-filled for ${creds.label} (${creds.identifier}). Click "Login" below to sign in.`
      )

      setTimeout(() => {
        const idInput = document.getElementById('identifier')
        if (idInput) {
          idInput.focus()
          idInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 50)
      return
    }

    // For non-administration categories, continue with standard quick demo login
    handleQuickLogin(roleKey)
  }

  useEffect(() => {
    // Session restoration across refreshes
    const savedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('collegeflow_token') : null
    const savedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('collegeflow_user') : null
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setAccount(parsed)
        // Verify with backend
        api.getMe().then((res) => {
          if (res && res.user) {
            setAccount(res.user)
            localStorage.setItem('collegeflow_user', JSON.stringify(res.user))
          }
        }).catch(() => {
          api.logout()
          setAccount(null)
        })
      } catch {}
    }

    if (typeof window !== 'undefined') {
      const hash = window.location.hash || ''
      const search = window.location.search || ''
      const pathname = window.location.pathname || ''

      if (pathname.includes('/verify/id-card/')) {
        const tok = pathname.split('/verify/id-card/')[1]?.split('/')[0]?.split('?')[0]
        if (tok) setVerificationToken(tok)
      } else if (hash.includes('verify/id-card/')) {
        const tok = hash.split('verify/id-card/')[1]?.split('&')[0]?.split('?')[0]
        if (tok) setVerificationToken(tok)
      } else if (search.includes('verify=')) {
        const params = new URLSearchParams(search)
        const tok = params.get('verify')
        if (tok) setVerificationToken(tok)
      }

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
    if (event) event.preventDefault()
    clearUrlHash()
    try {
      localStorage.removeItem('apna_sidebar_open')
      localStorage.removeItem('apna_sidebar_collapsed')
    } catch {}
    setError('')
    setAutoFillNotice('')
    setResetRequested(false)
    setIsSubmitting(true)

    try {
      const res = await api.login(identifier, password)
      if (res && res.success && res.user) {
        setAccount(res.user)
        return
      } else {
        setError(res?.message || 'We could not verify those sign-in details. Please check your College ID and password.')
      }
    } catch (apiErr) {
      setError(apiErr?.message || 'We could not verify those sign-in details. Please check your College ID and password.')
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
    try {
      localStorage.removeItem('apna_sidebar_open')
      localStorage.removeItem('apna_sidebar_collapsed')
    } catch {}
    setError('')
    setResetRequested(false)
    setIdentifier(roleKey)
    setPassword('gift123')

    try {
      const res = await api.login(roleKey, 'gift123')
      if (res && res.success && res.user) {
        setAccount(res.user)
        return
      }
    } catch (apiErr) {
      // In local development, if backend server is not running, provide demo fallback
      if (import.meta.env.DEV) {
        const acc = accounts[roleKey]
        if (acc) {
          setAccount(acc)
          return
        }
      }
      setError('Backend service unavailable. Please ensure the backend server is running.')
    }
  }

  function handleLogout() {
    api.logout()
    clearUrlHash()
    try {
      localStorage.removeItem('apna_sidebar_open')
      localStorage.removeItem('apna_sidebar_collapsed')
    } catch {}
    setAccount(null)
    setIdentifier('2305201001')
    setPassword('gift123')
    setError('')
    setAutoFillNotice('')
    setResetRequested(false)
  }

  // Public Timetable View (1-Click access without requiring login or authentication)
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

  // Role-based Router Guard
  if (account) {
    let portal = null
    if (account.role === 'super_admin') {
      portal = <SuperAdminPortal account={account} onLogout={handleLogout} onSwitchRole={handleQuickLogin} />
    } else if (account.role === 'management') {
      portal = <ManagementPortal account={account} onLogout={handleLogout} onSwitchRole={handleQuickLogin} />
    } else if (account.role === 'principal') {
      portal = <PrincipalPortal account={account} onLogout={handleLogout} onSwitchRole={handleQuickLogin} />
    } else if (account.role === 'admin') {
      portal = <AdminPortal account={account} onLogout={handleLogout} onSwitchRole={handleQuickLogin} />
    } else if (account.role === 'hod') {
      portal = <HodPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'faculty') {
      portal = <FacultyPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'accounts') {
      portal = <AccountsPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'scholarship') {
      portal = <ScholarshipPortal account={account} onLogout={handleLogout} onSwitchRole={handleQuickLogin} />
    } else if (account.role === 'exam_cell') {
      portal = <ExamCellPortal account={account} onLogout={handleLogout} onSwitchRole={handleQuickLogin} />
    } else if (account.role === 'library') {
      portal = <LibraryPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'warden' || account.role === 'hostel' || account.role === 'hostel_admin') {
      portal = <HostelPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'transport') {
      portal = <TransportPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'placement') {
      portal = <PlacementPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'staff') {
      portal = <StaffPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'canteen') {
      portal = <CanteenPortal account={account} onLogout={handleLogout} />
    } else if (account.role === 'campus_operations') {
      portal = <CampusOperationsPortal account={account} onLogout={handleLogout} onSwitchRole={handleQuickLogin} />
    } else if (account.role === 'admissions') {
      portal = <AdmissionsPortal account={account} onLogout={handleLogout} onSwitchRole={handleQuickLogin} />
    } else if (account.role === 'student') {
      portal = <StudentPortal account={account} onLogout={handleLogout} />
    }

    if (portal) {
      return (
        <ErrorBoundary>
          <UniversalWhatsAppLauncher account={account} hideTrigger={true} />
          <ApnaAIChatbot account={account} hideTrigger={true} />
          <UnifiedFloatingAssistant account={account} />
          {verificationToken && (
            <IdCardVerificationView
              token={verificationToken}
              onClose={() => {
                setVerificationToken('')
                clearUrlHash()
              }}
            />
          )}
          {portal}
        </ErrorBoundary>
      )
    }
  }

  // Otherwise render the Login Page first
  return (
    <>
      <UniversalWhatsAppLauncher account={account} hideTrigger={true} />
      <ApnaAIChatbot account={account} hideTrigger={true} />
      <UnifiedFloatingAssistant account={account} />
      {verificationToken && (
        <IdCardVerificationView
          token={verificationToken}
          onClose={() => {
            setVerificationToken('')
            clearUrlHash()
          }}
        />
      )}
      <main className="erp-split-page">
        {/* Left hero panel (Campus photo at golden hour with dark vignette) */}
        <div className="erp-hero-panel">
          <div className="erp-hero-content">
            {/* Top brand header */}
            <header className="erp-top-brand-wrapper">
              <div className="erp-top-brand">
                <div className="erp-logo-box">
                  <ApnaCampusSymbol size={36} />
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

            {/* Hero Main Content */}
            <div className="erp-hero-body">
              <div className="erp-hero-kicker">
                <span>LEARN</span>
                <span className="erp-kicker-sep">·</span>
                <span>GROW</span>
                <span className="erp-kicker-sep">·</span>
                <span>CONNECT</span>
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

              {/* Feature indicators with clean glass styling */}
              <div className="erp-feature-indicators">
                <div
                  className="erp-feature-item erp-feature-timetable-clickable"
                  onClick={() => setShowPublicTimetable(true)}
                  title="View Public Timetable (Direct Access)"
                >
                  <div className="erp-feature-icon-circle">
                    <Calendar size={15} />
                  </div>
                  <div className="erp-feature-text">
                    <span>Smart Timetable</span>
                  </div>
                </div>

                <div className="erp-feature-item" title="Digital Evaluations">
                  <div className="erp-feature-icon-circle">
                    <BarChart3 size={15} />
                  </div>
                  <div className="erp-feature-text">
                    <span>Digital Evaluations</span>
                  </div>
                </div>

                <div className="erp-feature-item" title="Smart Attendance">
                  <div className="erp-feature-icon-circle">
                    <UsersRound size={15} />
                  </div>
                  <div className="erp-feature-text">
                    <span>Smart Attendance</span>
                  </div>
                </div>
              </div>

              {/* Statistics row at bottom with vertical dividers */}
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

        {/* Right login panel: Clean White Floating Card */}
        <section className="erp-login-section" aria-label="Sign In">
          <div className="erp-login-card">
            <div className="erp-card-brand-header" style={{ marginBottom: '18px' }}>
              <div>
                <h2 className="erp-card-title">Welcome Back</h2>
                <p className="erp-card-subtitle">Sign in to your Apna Campus account</p>
              </div>
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
                    onChange={(e) => { setIdentifier(e.target.value); setError(''); setAutoFillNotice(''); }}
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
                    onChange={(e) => { setPassword(e.target.value); setError(''); setAutoFillNotice(''); }}
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

              {/* Options row */}
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

              {/* Feedback alert (Error or Password Reset feedback) */}
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

              {/* Auto-fill notification for Administration roles */}
              {autoFillNotice && (
                <div
                  className="erp-alert-box is-autofill"
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '14px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    lineHeight: 1.4,
                  }}
                  role="status"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                    <span style={{ fontWeight: 500 }}>{autoFillNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoFillNotice('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#15803d',
                      cursor: 'pointer',
                      fontSize: '16px',
                      lineHeight: 1,
                      padding: '0 4px',
                    }}
                    aria-label="Dismiss notice"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Cyan-to-blue gradient login button */}
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

              {/* New user / Activate account link */}
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

              {/* Section Divider */}
              <div className="erp-section-divider">
                <span>OR</span>
              </div>

              {/* Explore by Role Section */}
              <div className="erp-demo-section">
                <div className="erp-demo-header">
                  <h3 className="erp-demo-title">Explore by Role</h3>
                  <p className="erp-demo-subtitle">Explore the portal with different roles</p>
                </div>

                {/* 3 Category Cards */}
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
                          <strong className="erp-cat-name">{cat.categoryCode ? `${cat.categoryCode}. ` : ''}{cat.title}</strong>
                          <span className="erp-cat-count">{cat.count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Expanded Role Selection Popover / Drawer */}
                {expandedCategory && (
                  <div className="erp-expanded-roles-drawer">
                    <div className="erp-drawer-header">
                      <span>
                        Select {demoCategories.find((c) => c.id === expandedCategory)?.categoryCode ? `${demoCategories.find((c) => c.id === expandedCategory)?.categoryCode}. ` : ''}{demoCategories.find((c) => c.id === expandedCategory)?.title} Role:
                      </span>
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
                            onClick={() => {
                              handleRoleSelect(r.key, expandedCategory)
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

            {/* University Portal Footer */}
            <footer className="erp-card-footer">
              <div className="erp-footer-links">
                <a href="#help" onClick={(e) => e.preventDefault()}>Help</a>
                <span className="erp-footer-bar">|</span>
                <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy</a>
                <span className="erp-footer-bar">|</span>
                <a href="#contact" onClick={(e) => e.preventDefault()}>Contact</a>
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
              <p className="welcome-detail">{getTimeGreeting()}, {getGreetingDisplayName(account.name)}. Manage student continuous evaluation & assessments.</p>
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
