import { useState } from 'react'
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
  'student@gift.edu.in': {
    role: 'student',
    name: 'Rakesh Das',
    registrationNumber: '2305201001',
    department: 'Computer Science & Engineering',
    detail: 'Semester 5 · Section A',
  },
  'faculty@gift.edu.in': {
    role: 'faculty',
    name: 'Dr. S. Mohanty',
    identity: 'FAC-042',
    department: 'Computer Science & Engineering',
    detail: 'Faculty · School of Computing',
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
  'hod@gift.edu.in': {
    role: 'hod',
    name: 'Dr. P. K. Pattnaik',
    identity: 'HOD-CSE',
    department: 'Computer Science & Engineering',
    detail: 'Head of Department · CSE',
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
  'admin@gift.edu.in': {
    role: 'admin',
    name: 'Campus Administrator',
    identity: 'ADM-001',
    department: 'GIFT Autonomous, Bhubaneswar',
    detail: 'System administrator',
  },
  'admin': {
    role: 'admin',
    name: 'Campus Administrator',
    identity: 'ADM-001',
    department: 'GIFT Autonomous, Bhubaneswar',
    detail: 'System administrator',
  },
  'adm-001': {
    role: 'admin',
    name: 'Campus Administrator',
    identity: 'ADM-001',
    department: 'GIFT Autonomous, Bhubaneswar',
    detail: 'System administrator',
  },
  'accounts@gift.edu.in': {
    role: 'accounts',
    name: 'Mr. S. K. Roy',
    identity: 'ACC-012',
    department: 'Finance & Accounts',
    detail: 'Senior Accounts Officer',
  },
  'accounts': {
    role: 'accounts',
    name: 'Mr. S. K. Roy',
    identity: 'ACC-012',
    department: 'Finance & Accounts',
    detail: 'Senior Accounts Officer',
  },
  'warden@gift.edu.in': {
    role: 'warden',
    name: 'Mrs. Nibedita Das',
    identity: 'WRD-004',
    department: 'Hostel Administration',
    detail: 'Chief Resident Warden',
  },
  'warden': {
    role: 'warden',
    name: 'Mrs. Nibedita Das',
    identity: 'WRD-004',
    department: 'Hostel Administration',
    detail: 'Chief Resident Warden',
  },
  'canteen@gift.edu.in': {
    role: 'canteen',
    name: 'Mr. B. K. Sahoo',
    identity: 'CAN-007',
    department: 'Hospitality & Dining',
    detail: 'Smart Canteen Supervisor',
  },
  'canteen': {
    role: 'canteen',
    name: 'Mr. B. K. Sahoo',
    identity: 'CAN-007',
    department: 'Hospitality & Dining',
    detail: 'Smart Canteen Supervisor',
  },
}

const roleCopy = {
  student: { label: 'Student portal', icon: GraduationCap },
  faculty: { label: 'Faculty portal', icon: BookOpen },
  hod: { label: 'HOD portal', icon: ShieldCheck },
  admin: { label: 'Administration', icon: ShieldCheck },
  accounts: { label: 'Accounts portal', icon: ShieldCheck },
  warden: { label: 'Hostel portal', icon: ShieldCheck },
  canteen: { label: 'Canteen portal', icon: ShieldCheck },
}

function App() {
  const [identifier, setIdentifier] = useState('2305201001')
  const [password, setPassword] = useState('gift123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [account, setAccount] = useState(null)
  const [error, setError] = useState('')
  const [resetRequested, setResetRequested] = useState(false)
  const [showAdminRoles, setShowAdminRoles] = useState(false)

  async function handleLogin(event) {
    if (event) event.preventDefault()
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
    
    // Check if entered identifier matches any registered or newly added student
    const studentMatch = findStudentByQuery(key)
    if (studentMatch && (password === 'gift123' || password === 'password123')) {
      setActiveStudent(studentMatch.id)
      setAccount({
        role: 'student',
        ...studentMatch
      })
      return
    }

    const matchedAccount = accounts[key]
    if (!matchedAccount || (password !== 'gift123' && password !== 'password123')) {
      setError('We could not verify those sign-in details. Please check your College ID and password.')
      return
    }

    if (matchedAccount.role === 'student') {
      const activeStd = findStudentByQuery(matchedAccount.registrationNumber) || getActiveStudent()
      setAccount({ ...matchedAccount, ...(activeStd || {}) })
    } else {
      setAccount(matchedAccount)
    }
  }

  async function handleQuickLogin(roleKey) {
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
    setAccount(null)
    setIdentifier('2305201001')
    setPassword('gift123')
    setError('')
    setResetRequested(false)
  }

  // Role-based Router Guard
  if (account) {
    if (account.role === 'admin') {
      return <AdminPortal account={account} onLogout={handleLogout} onSwitchRole={handleQuickLogin} />
    }
    if (account.role === 'hod') {
      return <HodPortal account={account} onLogout={handleLogout} />
    }
    if (account.role === 'faculty') {
      return <FacultyPortal account={account} onLogout={handleLogout} />
    }
    if (account.role === 'accounts') {
      return <AccountsPortal account={account} onLogout={handleLogout} />
    }
    if (account.role === 'warden') {
      return <HostelPortal account={account} onLogout={handleLogout} />
    }
    if (account.role === 'canteen') {
      return <CanteenPortal account={account} onLogout={handleLogout} />
    }
    if (account.role === 'student') {
      return <StudentPortal account={account} onLogout={handleLogout} />
    }
  }

  // Otherwise render the Login Page first
  return (
    <main className="login-page">
      {/* ── Left hero panel (campus photo & stats) ── */}
      <div className="campus-scene" aria-hidden="true">
        <div className="campus-hero-content">
          <a className="top-brand" href="#home" aria-label="GIFT Autonomous home">
            <GiftMark />
            <span>GIFT Autonomous</span>
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
        <a className="panel-brand" href="#home">
          <GiftMark />
          <span>GIFT Autonomous, Bhubaneswar</span>
        </a>
        <h1 id="login-title">Welcome back</h1>
        <p className="panel-subtitle">Sign in to access your College Management Portal</p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="field-group">
            <label className="field-label" htmlFor="identifier">College ID</label>
            <div className="input-wrap">
              <UserRound aria-hidden="true" size={17} />
              <input
                id="identifier"
                name="identifier"
                autoComplete="username"
                placeholder="Registration number or college email"
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

          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Demo Login:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="admin-login-button"
                  style={{ flex: 1, margin: 0, justifyContent: 'center', fontSize: '0.85rem', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => handleQuickLogin('admin')}
                  title="Direct Login as Administrator"
                >
                  <UsersRound size={16} /> Admin
                </button>
                <button
                  type="button"
                  className="admin-login-button"
                  style={{ width: 'auto', margin: 0, padding: '0.6rem 0.85rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={() => setShowAdminRoles(prev => !prev)}
                  title="Toggle Admin Sub-Roles (Role Impersonation)"
                  aria-expanded={showAdminRoles}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Options</span>
                  {showAdminRoles ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>

              {/* Inside the Admin Option: 4th Image Functions */}
              {showAdminRoles && (
                <div style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 0.45rem 0', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Inside Admin Option · Role Functions:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="admin-login-button"
                      style={{ margin: 0, justifyContent: 'center', fontSize: '0.72rem', padding: '0.45rem 0.3rem' }}
                      onClick={() => handleQuickLogin('student')}
                    >
                      <GraduationCap size={13} /> Student
                    </button>
                    <button
                      type="button"
                      className="admin-login-button"
                      style={{ margin: 0, justifyContent: 'center', fontSize: '0.72rem', padding: '0.45rem 0.3rem' }}
                      onClick={() => handleQuickLogin('faculty')}
                    >
                      <BookOpen size={13} /> Faculty
                    </button>
                    <button
                      type="button"
                      className="admin-login-button"
                      style={{ margin: 0, justifyContent: 'center', fontSize: '0.72rem', padding: '0.45rem 0.3rem' }}
                      onClick={() => handleQuickLogin('hod')}
                    >
                      <ShieldCheck size={13} /> HOD
                    </button>
                    <button
                      type="button"
                      className="admin-login-button"
                      style={{ margin: 0, justifyContent: 'center', fontSize: '0.72rem', padding: '0.45rem 0.3rem' }}
                      onClick={() => handleQuickLogin('accounts')}
                    >
                      <CreditCard size={13} /> Accounts
                    </button>
                    <button
                      type="button"
                      className="admin-login-button"
                      style={{ margin: 0, justifyContent: 'center', fontSize: '0.72rem', padding: '0.45rem 0.3rem' }}
                      onClick={() => handleQuickLogin('warden')}
                    >
                      <Home size={13} /> Warden
                    </button>
                    <button
                      type="button"
                      className="admin-login-button"
                      style={{ margin: 0, justifyContent: 'center', fontSize: '0.72rem', padding: '0.45rem 0.3rem' }}
                      onClick={() => handleQuickLogin('canteen')}
                    >
                      <Utensils size={13} /> Canteen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        <footer className="site-footer">
          <div className="footer-links">
            <a href="mailto:info@gift.edu.in"><Mail size={13} />info@gift.edu.in</a>
            <span className="footer-dot" aria-hidden="true" />
            <a href="https://www.gift.edu.in/" target="_blank" rel="noreferrer">www.gift.edu.in</a>
          </div>
          <p>© 2026 GIFT Autonomous College. All rights reserved.</p>
        </footer>
      </section>
    </main>
  )
}

function Dashboard({ account, onLogout }) {
  const { label, icon: RoleIcon } = roleCopy[account.role]

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <a className="dashboard-brand" href="#home" aria-label="GIFT Autonomous">
          <GiftMark />
          <span>GIFT AUTONOMOUS, BHUBANESWAR</span>
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

function GiftMark() {
  return (
    <span className="gift-mark" aria-hidden="true">
      <span className="mark-gear">✿</span>
      <span className="mark-center">GIFT<small>✦</small></span>
    </span>
  )
}

export default App
