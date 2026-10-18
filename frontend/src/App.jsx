import { useState, useEffect } from 'react'
import {
  ArrowRight,
  BookOpen,
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
import MarksManagementModule from './marks/MarksManagementModule.jsx'
import { api } from './services/api.js'
import { getActiveStudent, setActiveStudent, findStudentByQuery } from './services/studentStore.js'
import { getTimeGreeting } from './utils/timeGreeting.js'

const accounts = {
  '2305201001': {
    role: 'student',
    name: 'Rakesh Das',
    registrationNumber: '2305201001',
    department: 'Computer Science & Engineering',
    detail: 'Semester 5 · Section A',
  },
  'student': {
    role: 'student',
    name: 'Rakesh Das',
    registrationNumber: '2305201001',
    department: 'Computer Science & Engineering',
    detail: 'Semester 5 · Section A',
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
  'management': {
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
}

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

function App() {
  const [identifier, setIdentifier] = useState('2305201001')
  const [password, setPassword] = useState('gift123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [account, setAccount] = useState(null)
  const [error, setError] = useState('')
  const [resetRequested, setResetRequested] = useState(false)
  const [activationModalOpen, setActivationModalOpen] = useState(false)
  const [activationTokenInput, setActivationTokenInput] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || ''
      const search = window.location.search || ''
      if (hash.includes('activate?token=')) {
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
    setError('')
    setResetRequested(false)

    try {
      const res = await api.login(identifier, password)
      if (res && res.success && res.user) {
        setAccount(res.user)
        return
      }
    } catch (apiErr) {
      // Fallback to local accounts dictionary if server is not reached
      console.info('Attempting fallback authentication:', apiErr.message)
    }

    const key = identifier.trim().toLowerCase()

    // Accepted passwords: gift123, password123, or Gift@YEAR (auto-generated for admitted students)
    const isValidPassword = (pwd) =>
      pwd === 'gift123' ||
      pwd === 'password123' ||
      /^Gift@\d{4}$/.test(pwd) // e.g. Gift@2023, Gift@2026

    if (!isValidPassword(password)) {
      setError('We could not verify those sign-in details. Please check your College ID and password.')
      return
    }

    // 1. Check if entered identifier matches any registered student in the store
    //    (covers both original roll numbers AND auto-generated reg numbers like 23CSE0092)
    const studentMatch = findStudentByQuery(key)
    if (studentMatch) {
      // Accept if password matches their stored defaultPassword OR any accepted password
      const storedDefaultPwd = studentMatch.defaultPassword
      if (
        isValidPassword(password) ||
        (storedDefaultPwd && password === storedDefaultPwd)
      ) {
        setActiveStudent(studentMatch.id)
        setAccount({
          role: 'student',
          ...studentMatch,
        })
        return
      }
    }

    // 2. Match exact account dictionary (staff / demo accounts)
    const matchedAccount = accounts[key]
    if (matchedAccount) {
      if (matchedAccount.role === 'student') {
        const activeStd = findStudentByQuery(matchedAccount.registrationNumber) || getActiveStudent()
        setAccount({ ...matchedAccount, ...(activeStd || {}) })
      } else {
        setAccount(matchedAccount)
      }
      return
    }

    // 3. Role-prefix automatic routing for any valid institutional ID
    if (key.startsWith('super')) {
      setAccount(accounts['super_admin'])
      return
    }
    if (key.startsWith('mgmt') || key.includes('management') || key.includes('director') || key.includes('trustee')) {
      setAccount(accounts['management'])
      return
    }
    if (key.startsWith('prin')) {
      setAccount(accounts['principal'])
      return
    }
    if (key.startsWith('exam') || key.includes('coe')) {
      setAccount(accounts['exam_cell'])
      return
    }
    if (key.startsWith('lib')) {
      setAccount(accounts['library'])
      return
    }
    if (key.startsWith('trans') || key.includes('bus')) {
      setAccount(accounts['transport'])
      return
    }
    if (key.startsWith('place') || key.includes('tpo')) {
      setAccount(accounts['placement'])
      return
    }
    if (key.startsWith('staff') || key.includes('tech') || key.includes('lab')) {
      setAccount(accounts['staff'])
      return
    }
    if (key.startsWith('fac') || key.includes('faculty')) {
      setAccount(accounts['faculty'])
      return
    }
    if (key.startsWith('hod')) {
      setAccount(accounts['hod'])
      return
    }
    if (key.startsWith('adm')) {
      setAccount(accounts['admin'])
      return
    }
    if (key.startsWith('acc') || key.includes('account')) {
      setAccount(accounts['accounts'])
      return
    }
    if (key.startsWith('wrd') || key.includes('warden')) {
      setAccount(accounts['warden'])
      return
    }
    if (key.startsWith('can') || key.includes('canteen')) {
      setAccount(accounts['canteen'])
      return
    }
    // 4. Numeric reg number fallback (6-12 digits) — treat as student
    if (/^\d{6,12}$/.test(key)) {
      const demoStd = getActiveStudent() || {}
      setAccount({
        role: 'student',
        ...demoStd,
        registrationNumber: identifier,
        rollNumber: identifier.slice(-2) || '01',
      })
      return
    }

    setError('We could not verify those sign-in details. Please check your College ID and password.')
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
    setIdentifier(roleKey)
    setPassword('gift123')

    if (roleKey === 'student') {
      const activeStd = getActiveStudent()
      if (activeStd) {
        setAccount({
          role: 'student',
          ...activeStd
        })
        return
      }
    }

    try {
      const res = await api.login(roleKey, 'gift123')
      if (res && res.success && res.user) {
        setAccount(res.user)
        return
      }
    } catch (apiErr) {
      // Fallback
    }

    const acc = accounts[roleKey]
    if (acc) {
      setAccount(acc)
    }
  }

  function handleLogout() {
    api.logout()
    clearUrlHash()
    setAccount(null)
    setIdentifier('2305201001')
    setPassword('gift123')
    setError('')
    setResetRequested(false)
  }

  // Role-based Router Guard
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
          <UniversalWhatsAppLauncher account={account} />
          <ApnaAIChatbot account={account} />
          {portal}
        </>
      )
    }
  }

  // Otherwise render the Login Page first (with universal WhatsApp launcher & Apna AI visible)
  return (
    <>
      <UniversalWhatsAppLauncher account={null} />
      <ApnaAIChatbot account={null} />
      <main className="login-page">
      {/* ── Left hero panel (campus photo & stats) ── */}
      <div className="campus-scene" aria-hidden="true">
        <div className="campus-hero-content">
          <a className="top-brand" href="#home" aria-label="Apna Campus home">
            <GiftMark size={38} />
            <span>Apna Campus</span>
          </a>
          <div className="hero-body">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Academic Year 2026–27 · Active
            </div>
            <h2 className="hero-title">
              Empowering<br />
              <span>Academic Excellence</span>
            </h2>
            <p className="hero-description">
              Your complete college ecosystem — academics, attendance, fees,
              exams and more, all in one secure portal.
            </p>
            <div className="hero-stats">
              <div className="hero-stat"><strong>2,480</strong><small>Students</small></div>
              <div className="hero-stat"><strong>146</strong><small>Faculty</small></div>
              <div className="hero-stat"><strong>18</strong><small>Programs</small></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <section className="login-panel" aria-labelledby="login-title">
        <a className="panel-brand" href="#home" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GiftMark size={44} />
          <span>Apna Campus</span>
        </a>
        <h1 id="login-title">Welcome back</h1>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="field-group">
            <label className="field-label" htmlFor="identifier">College ID / Registration Number</label>
            <div className="input-wrap">
              <UserRound aria-hidden="true" size={17} />
              <input
                id="identifier"
                name="identifier"
                autoComplete="username"
                placeholder="e.g. 23CSE0001 · FAC-042 · ADM-001"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <LockKeyhole aria-hidden="true" size={17} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                className="visibility-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-option">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span className="checkmark"><Check size={11} /></span>
              <span>Remember me</span>
            </label>
            <button
              className="text-button"
              type="button"
              onClick={() => { setResetRequested(true); setError('') }}
            >
              Forgot password?
            </button>
          </div>

          {(error || resetRequested) && (
            <p className={`form-feedback ${error ? 'is-error' : ''}`} role="status">
              {error || 'Password reset link and OTP instructions sent to your registered college phone.'}
            </p>
          )}

          <button className="login-button" type="submit">
            <span>Sign In</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.82rem' }}>
            <span style={{ color: '#64748b' }}>Newly admitted student? </span>
            <button
              type="button"
              onClick={() => { setActivationModalOpen(true); setActivationTokenInput(''); }}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              Activate with security token
            </button>
          </div>

          {/* 1-Click Role Switcher Demo Bar */}
          <div style={{ marginTop: '18px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', textAlign: 'center' }}>
              ⚡ 1-Click Quick Demo Sign-In (15 Roles)
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', justifyContent: 'center' }}>
              {[
                { key: 'super_admin', label: 'Super Admin', color: '#4338ca' },
                { key: 'management', label: 'Management', color: '#b45309' },
                { key: 'principal', label: 'Principal', color: '#0369a1' },
                { key: 'admin', label: 'Admin Ops', color: '#1d4ed8' },
                { key: 'admissions', label: 'Admissions', color: '#0284c7' },
                { key: 'hod', label: 'HOD', color: '#047857' },
                { key: 'faculty', label: 'Faculty', color: '#15803d' },
                { key: 'student', label: 'Student', color: '#1d4ed8' },
                { key: 'exam_cell', label: 'Exam Cell', color: '#6d28d9' },
                { key: 'accounts', label: 'Accounts', color: '#0f766e' },
                { key: 'library', label: 'Library', color: '#047857' },
                { key: 'placement', label: 'Placement', color: '#be185d' },
                { key: 'transport', label: 'Transport', color: '#0369a1' },
                { key: 'warden', label: 'Hostel', color: '#b45309' },
                { key: 'staff', label: 'Staff (Labs)', color: '#0f766e' },
              ].map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleQuickLogin(r.key)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    borderRadius: '7px',
                    border: `1.5px solid ${r.color}44`,
                    background: `${r.color}14`,
                    color: r.color,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = `${r.color}25` }}
                  onMouseOut={(e) => { e.currentTarget.style.background = `${r.color}14` }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        <footer className="site-footer">
          <div className="footer-links">
            <a href="mailto:info@apnacampus.edu.in"><Mail size={13} />info@apnacampus.edu.in</a>
            <span className="footer-dot" aria-hidden="true" />
            <a href="https://www.apnacampus.edu.in/" target="_blank" rel="noreferrer">www.apnacampus.edu.in</a>
          </div>
          <p>© 2026 Apna Campus. All rights reserved.</p>
        </footer>
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
