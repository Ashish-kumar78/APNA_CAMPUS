import { useState, useEffect } from 'react'
import {
  Award,
  BookOpen,
  Briefcase,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  Star,
  Target,
  TrendingUp,
  User,
  Users,
  Video,
} from 'lucide-react'
import './PlacementPage.css'
import placementStore from '../services/placementStore.js'

const DEFAULT_COMPANIES = [
  { name: 'TCS', logo: 'TCS', color: '#1a5276', package: '3.6 LPA', positions: ['Software Engineer', 'Data Analyst'], deadline: '25 Oct 2026' },
  { name: 'Infosys', logo: 'IF', color: '#007DC6', package: '3.4 LPA', positions: ['Systems Engineer'], deadline: '28 Oct 2026' },
  { name: 'Wipro', logo: 'WP', color: '#521472', package: '3.5 LPA', positions: ['Project Engineer'], deadline: '01 Nov 2026' },
  { name: 'Cognizant', logo: 'CT', color: '#005eb8', package: '4.0 LPA', positions: ['Programmer Analyst'], deadline: '05 Nov 2026' },
  { name: 'HCL Technologies', logo: 'HCL', color: '#0075c2', package: '3.8 LPA', positions: ['Graduate Engineer Trainee'], deadline: '10 Nov 2026' },
  { name: 'Tech Mahindra', logo: 'TM', color: '#d9272e', package: '3.25 LPA', positions: ['Software Engineer'], deadline: '15 Nov 2026' },
]

const DEFAULT_COURSES = [
  { title: 'Aptitude & Reasoning Bootcamp', provider: 'T&P Cell', duration: '20 hours', enrolled: true, progress: 65 },
  { title: 'Resume Writing Workshop', provider: 'T&P Cell', duration: '3 hours', enrolled: true, progress: 100 },
  { title: 'Data Structures for Interviews', provider: 'Self-paced', duration: '15 hours', enrolled: false, progress: 0 },
  { title: 'Communication Skills & GD Prep', provider: 'T&P Cell', duration: '10 hours', enrolled: false, progress: 0 },
  { title: 'Mock Interview Series', provider: 'T&P Cell', duration: '6 sessions', enrolled: true, progress: 33 },
]

const placementStats = {
  batchYear: '2023–2027',
  eligible: 68,
  placed: 42,
  avgPackage: '4.2 LPA',
  highestPackage: '14 LPA',
  topRecruiter: 'Amazon',
}

export default function PlacementPage() {
  const [activeTab, setActiveTab] = useState('drive')
  const [registered, setRegistered] = useState({})
  const [registerMsg, setRegisterMsg] = useState('')
  const [drivesList, setDrivesList] = useState(() => {
    const published = placementStore.getPublishedDrives()
    return published.length > 0 ? published : DEFAULT_COMPANIES
  })
  const [coursesList, setCoursesList] = useState(() => {
    const list = placementStore.getTrainingPrograms()
    return list.length > 0 ? list : DEFAULT_COURSES
  })

  // Synchronize in real time with Placement Cell actions
  useEffect(() => {
    const syncData = () => {
      const published = placementStore.getPublishedDrives()
      if (published.length > 0) {
        setDrivesList(published)
      }
      const trn = placementStore.getTrainingPrograms()
      if (trn.length > 0) {
        setCoursesList(trn)
      }
    }

    const unsub = placementStore.subscribe(syncData)
    window.addEventListener('cms_placement_updated', syncData)
    return () => {
      unsub()
      window.removeEventListener('cms_placement_updated', syncData)
    }
  }, [])

  function register(company) {
    const compName = company.company || company.name
    const compRole = company.role || (company.positions && company.positions[0]) || 'Engineer'
    setRegistered((prev) => ({ ...prev, [compName]: true }))

    // Sync to centralized ATS application pipeline
    placementStore.addStudentApplication({
      studentName: 'BISHNU PRASAD SAHOO',
      regNo: '2401432265',
      rollNo: '2401432265',
      branch: 'Computer Science & Engineering',
      deptCode: 'CSE',
      cgpa: 8.42,
      company: compName,
      jobRole: compRole,
      ctcOffered: company.packageOffered || company.package || 'As per drive specifications',
      notes: 'Registered through student Self Development & Placement module.',
    })

    setRegisterMsg(`Registered for ${compName} placement drive. Check your email for further details.`)
    setTimeout(() => setRegisterMsg(''), 5000)
  }

  // Map drives to uniform card representation
  const displayCompanies = drivesList.map((d) => {
    return {
      name: d.company || d.name,
      logo: d.companyLogo || d.logo || (d.company || d.name || '').slice(0, 3).toUpperCase(),
      color: d.companyColor || d.color || '#1a5276',
      package: d.packageOffered || d.package || 'Competitive',
      positions: d.positions || [d.role || 'Software Engineer'],
      deadline: d.recruitmentProcess?.applicationDeadline || d.deadline || d.driveDate || 'Upcoming',
      isClosed: (d.status || '').toLowerCase() === 'closed',
      minCgpa: d.eligibilityCriteria?.minCgpa,
      branches: Array.isArray(d.eligibilityCriteria?.allowedBranches)
        ? d.eligibilityCriteria.allowedBranches.join(', ')
        : d.eligibilityCriteria?.allowedBranches,
      raw: d,
    }
  })

  // Map courses to uniform representation
  const displayCourses = coursesList.map((c) => ({
    title: c.title,
    provider: c.trainer || c.provider || 'T&P Cell',
    duration: c.duration || '10 hours',
    enrolled: c.enrolled !== undefined ? c.enrolled : (c.enrolledCount > 0),
    progress: c.progress !== undefined ? c.progress : 0,
    status: c.status || 'Active',
  }))

  return (
    <div className="placement-page">
      <div className="placement-header">
        <div>
          <p className="placement-kicker"><TrendingUp size={13} />TRAINING & PLACEMENT</p>
          <h2>Self Development & Placement</h2>
          <p className="placement-caption">Campus recruitment drives, skill development courses and placement records.</p>
        </div>
        <div className="placement-eligibility">
          <Check size={14} />
          <div>
            <strong>Placement Eligible</strong>
            <small>CGPA 8.42 · No Backlogs · Active</small>
          </div>
        </div>
      </div>

      {/* Official Placement Broadcast Channel Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={18} />
          </div>
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#fff', display: 'block' }}>📢 Official Campus Placement Broadcast Channel</strong>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Latest recruitment drive notifications, eligibility criteria, and interview links are live in Campus Connect.</span>
          </div>
        </div>
        <button
          type="button"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('cms_navigate_chat', { detail: { convId: 'conv-placement' } }));
          }}
        >
          Open Placement Channel →
        </button>
      </div>

      <div className="placement-stats-strip">
        <div><strong>{placementStats.eligible}</strong><small>Eligible Students</small></div>
        <div><strong>{placementStats.placed}</strong><small>Placed (2026)</small></div>
        <div><strong>{placementStats.avgPackage}</strong><small>Avg. Package</small></div>
        <div><strong>{placementStats.highestPackage}</strong><small>Highest Package</small></div>
        <div><strong>{placementStats.topRecruiter}</strong><small>Top Recruiter</small></div>
      </div>

      <div className="placement-tabs" role="tablist">
        {[
          { key: 'drive', label: 'Placement Drives' },
          { key: 'courses', label: 'Skill Development' },
          { key: 'stats', label: 'Placement Records' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={activeTab === key ? 'active' : ''}
            role="tab"
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {registerMsg && <div className="placement-register-msg"><Check size={13} />{registerMsg}</div>}

      {activeTab === 'drive' && (
        <div className="placement-drive-list">
          {displayCompanies.map((company) => (
            <div key={company.name} className="company-card">
              <div className="company-logo" style={{ background: company.color }}>{company.logo}</div>
              <div className="company-body">
                <h3>{company.name}</h3>
                <div className="company-meta">
                  <span><Star size={11} />Package: {company.package}</span>
                  <span><Briefcase size={11} />Roles: {company.positions.join(', ')}</span>
                  <span><FileText size={11} />Deadline: {company.deadline}</span>
                  {company.minCgpa && (
                    <span style={{ color: '#0284c7' }}><Target size={11} />Min CGPA: {company.minCgpa}</span>
                  )}
                </div>
              </div>
              <div className="company-action">
                {company.isClosed ? (
                  <span className="badge-status" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 600 }}>
                    Applications Closed
                  </span>
                ) : registered[company.name] ? (
                  <span className="company-registered"><Check size={13} />Registered</span>
                ) : (
                  <button className="company-register-btn" onClick={() => register(company)}>
                    Register <ChevronRight size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="skill-courses-list">
          {displayCourses.map((course, i) => (
            <div key={i} className={`skill-course-card ${course.enrolled ? 'enrolled' : ''}`}>
              <div className="skill-course-icon">
                {course.progress === 100 ? <Award size={20} /> : course.enrolled ? <Video size={20} /> : <BookOpen size={20} />}
              </div>
              <div className="skill-course-body">
                <h3>{course.title}</h3>
                <div className="skill-course-meta">
                  <span><User size={11} />{course.provider}</span>
                  <span><Star size={11} />{course.duration}</span>
                </div>
                {course.enrolled && (
                  <div className="skill-course-progress">
                    <div className="skill-progress-bar">
                      <div className="skill-progress-fill" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span>{course.progress}%</span>
                  </div>
                )}
              </div>
              <div className="skill-course-action">
                {course.progress === 100 ? (
                  <span className="course-completed"><Check size={12} />Completed</span>
                ) : course.enrolled ? (
                  <button className="course-continue-btn">Continue <ChevronRight size={12} /></button>
                ) : (
                  <button className="course-enroll-btn">Enroll <ChevronRight size={12} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="placement-records">
          <div className="records-chart-placeholder">
            <TrendingUp size={32} />
            <strong>Placement Statistics 2026</strong>
            <div className="records-bar-chart">
              {[
                { year: '2022–23', placed: 78, total: 94 },
                { year: '2023–24', placed: 85, total: 102 },
                { year: '2024–25', placed: 91, total: 108 },
                { year: '2025–26', placed: 97, total: 112 },
              ].map((item) => (
                <div key={item.year} className="records-bar-item">
                  <div className="records-bar-wrap">
                    <div
                      className="records-bar"
                      style={{ height: `${(item.placed / item.total) * 100}%` }}
                    />
                  </div>
                  <span>{item.placed}/{item.total}</span>
                  <small>{item.year}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="top-recruiters-section">
            <h3><Users size={14} />Top Recruiters</h3>
            <div className="recruiter-tags">
              {['Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'HCL', 'Accenture', 'Tech Mahindra', 'IBM', 'Capgemini'].map((r) => (
                <span key={r} className="recruiter-tag">{r}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
